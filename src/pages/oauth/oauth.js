import React from 'react';
import PropTypes from 'prop-types';
import OpenShiftResourceParser from '../../components/openshiftResourceParser';

class OAuthPage extends React.Component {
  componentDidMount() {
    const resourceParser = new OpenShiftResourceParser(window.OPENSHIFT_CONFIG);

    resourceParser.finishOAuth().then(data => {
      const url = new URL(data.then);
      this.props.history.push(url.pathname);
    });
  }

  render() {
    return <div>Authenticating...</div>;
  }
}

OAuthPage.propTypes = {
  history: PropTypes.object.isRequired
};

export { OAuthPage as default };
