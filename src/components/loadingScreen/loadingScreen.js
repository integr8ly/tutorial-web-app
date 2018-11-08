import React from 'react';
import PropTypes from 'prop-types';
import { ProgressBar } from 'patternfly-react';

class LoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: true, complete: false };
  }
  render() {
    if (this.props.progress === 10 && !this.state.complete) {
      setTimeout(() => {
        this.setState({ show: false, complete: true });
      }, this.props.hideDelay);
    }
    if (!this.state.show) {
      return '';
    }

    return (
      <React.Fragment>
        <div className="integr8ly-loadingscreen">
          {this.props.showBackdrop === true && (
            <div className="integr8ly-loadingscreen-backdrop">
              <div className="integr8ly-loadingscreen-logo" />
            </div>
          )}
          <div className="integr8ly-loadingscreen-spacer">
            <object className="integr8ly-loadingscreen-throbber" data={this.props.throbberImage} type="image/svg+xml">
              Loading...
            </object>
          </div>
          <h2 className="integr8ly-loadingscreen-text integr8ly-congratulations-heading">
            {this.props.loadingText}
            <br />
            {this.props.standbyText}
          </h2>
          <div className="integr8ly-loadingscreen-progress">
            <ProgressBar className="integr8ly-loadingscreen-progressbar" now={this.props.progress} />
            <span className="integr8ly-loadingscreen-progress-label">{this.props.progress}%</span>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

LoadingScreen.propTypes = {
  showBackdrop: PropTypes.bool,
  progress: PropTypes.number,
  throbberImage: PropTypes.string,
  loadingText: PropTypes.string,
  standbyText: PropTypes.string,
  hideDelay: PropTypes.number
};

LoadingScreen.defaultProps = {
  hideDelay: 2500,
  showBackdrop: true,
  progress: 0,
  throbberImage: require('./resources/StartingServices_Final.svg'),
  loadingText: 'Loading...',
  standbyText: 'Please stand by.'
};

export default LoadingScreen;
