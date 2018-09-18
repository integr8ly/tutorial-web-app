import React from 'react';
import PropTypes from 'prop-types';
import { finishOAuth } from '../../services/openshiftServices';

class OAuthPage extends React.Component {
  componentDidMount() {
    finishOAuth().then(data => {
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
