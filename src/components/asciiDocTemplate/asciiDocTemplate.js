import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Asciidoctor from 'asciidoctor.js';
import { translate } from 'react-i18next';
import CopyField from '../copyField/copyField';

class AsciiDocTemplate extends React.Component {
  state = { loaded: false, html: null };

  constructor(props) {
    super(props);
    this.isUnmounted = false;
    this.rootDiv = React.createRef();
  }

  componentDidMount() {
    const { i18n, template, adoc, attributes } = this.props;
    if (adoc) {
      fetch(`${process.env.REACT_APP_STEELTHREAD_ASCIIDOC_PATH}/${i18n.language}/${adoc}`)
        .then(res => res.text())
        .then(html => {
          const asciidoctor = Asciidoctor();
          const asciihtml = asciidoctor.convert(html, { attributes });
          !this.isUnmounted && this.setState({ loaded: true, html: asciihtml });
        });
    } else if (template) {
      fetch(`${process.env.REACT_APP_STEELTHREAD_ASCIIDOC_PATH}/${i18n.language}/${template}`)
        .then(res => res.text())
        .then(html => {
          !this.isUnmounted && this.setState({ loaded: true, html });
        });
    }
  }

  componentDidUpdate() {
    if (this.rootDiv.current) {
      const codeBlocks = this.rootDiv.current.querySelectorAll('pre');
      codeBlocks.forEach(block => {
        ReactDOM.render(<CopyField value={block.innerText} multiline={block.clientHeight > 40} />, block.parentNode);
      });
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  render() {
    const { loaded, html } = this.state;
    if (loaded) {
      return <div ref={this.rootDiv} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    return null;
  }
}

AsciiDocTemplate.propTypes = {
  i18n: PropTypes.object.isRequired,
  template: PropTypes.string,
  adoc: PropTypes.string,
  attributes: PropTypes.object
};

AsciiDocTemplate.defaultProps = {
  template: '',
  adoc: '',
  attributes: {}
};

const ConnectedAsciiDocTemplate = translate()(AsciiDocTemplate);

export { ConnectedAsciiDocTemplate as default, AsciiDocTemplate };
