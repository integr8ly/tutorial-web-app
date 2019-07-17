import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Asciidoctor from 'asciidoctor.js';
import { translate } from 'react-i18next';

// import CopyField from '../copyField/copyField';
import { ClipboardCopy } from '@patternfly/react-core';

class AsciiDocTemplate extends React.Component {
  state = { loaded: false, docContent: null };

  constructor(props) {
    super(props);
    this.isUnmounted = false;
    this.rootDiv = React.createRef();
  }

  componentDidMount() {
    const { i18n, template, adoc } = this.props;
    const docResource = adoc || template;
    if (!docResource) {
      return;
    }
    const docEndpoint = `${process.env.REACT_APP_STEELTHREAD_ASCIIDOC_PATH}/${i18n.language}/${docResource}`;
    fetch(docEndpoint)
      .then(res => res.text())
      .then(html => {
        !this.isUnmounted && this.setState({ loaded: true, docContent: html });
      });
  }

  componentDidUpdate() {
    if (this.rootDiv.current) {
      const codeBlocks = this.rootDiv.current.querySelectorAll('pre');
      codeBlocks.forEach(block => {
        // ReactDOM.render(<CopyField value={block.innerText} multiline={block.clientHeight > 40} />, block.parentNode);
        ReactDOM.render(<ClipboardCopy>{block.innerText}</ClipboardCopy>);
      });
    }
  }

  getDocContent() {
    if (this.props.template) {
      return this.state.docContent;
    }
    const adoc = Asciidoctor();
    if (!this.state.docContent) {
      return null;
    }
    return adoc.convert(this.state.docContent, { loaded: true, attributes: this.props.attributes });
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return <div ref={this.rootDiv} dangerouslySetInnerHTML={{ __html: this.getDocContent() }} />;
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
