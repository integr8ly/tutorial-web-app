import React from 'react';
import OpenShiftResourceParser from "openshift-resource-parser";

class OAuthPage extends React.Component {
  componentDidMount() {
    const resourceParser = new OpenShiftResourceParser(window.OPENSHIFT_CONFIG);

    resourceParser.finishOAuth().then(function (data) {
      const url = new URL(data.then);
      this.props.history.push(url.pathname);
    }.bind(this));
  }

  render() {
    return <div>Authenticating...</div>;
  }
}

export { OAuthPage as default };
