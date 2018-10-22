import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'patternfly-react';

class ErrorScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: true };
  }

  onTryAgain = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.show) {
      return '';
    }

    return (
      <React.Fragment>
        <div className="integr8ly-errorscreen">
          <div className="integr8ly-errorscreen-backdrop">
            <div className="integr8ly-errorscreen-logo" />
          </div>
          <object className="integr8ly-errorscreen-error-img" data={this.props.throbberImage} type="image/svg+xml">
            Loading...
          </object>
          <h2 className="integr8ly-errorscreen-info-text">
            {this.props.errorText}
            <br />
            {this.props.proceedText}
          </h2>
          <Button variant="secondary" className="integr8ly-errorscreen-info-btn" onClick={this.onTryAgain}>
            Try again
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

ErrorScreen.propTypes = {
  throbberImage: PropTypes.string,
  errorText: PropTypes.string,
  proceedText: PropTypes.string
};

ErrorScreen.defaultProps = {
  throbberImage: require('./resources/StartingServices_Error.svg'),
  errorText: 'We encountered a problem putting the finishing touches on your new environment.',
  proceedText: 'How would you like to proceed?'
};

export default ErrorScreen;
