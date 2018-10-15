import React from 'react';
import PropTypes from 'prop-types';
import { ProgressBar } from 'patternfly-react';

class LoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: true, complete: false };
  }
  render() {
    if (this.props.progress === 100 && !this.state.complete) {
      setTimeout(() => {
        this.setState({ show: false, complete: true });
      }, this.props.hideDelay);
    }
    if (!this.state.show) {
      return '';
    }

    const backdropStyle = {
      opacity: this.props.backdropOpacity
    };
    if (this.props.backdropImage !== null) {
      backdropStyle['background-image'] = `url("${this.props.backdropImage}")`;
    } else {
      backdropStyle['background-color'] = this.props.backdropColor;
    }

    const logoStyle = {
      'background-image': `url(" ${this.props.logo}")`
    };

    return (
      <React.Fragment>
        {this.props.showBackdrop === true && (
          <div className="integr8ly-loadingscreen-backdrop" style={backdropStyle}>
            <div className="integr8ly-loadingscreen-logo" style={logoStyle} />
          </div>
        )}
        <object className="integr8ly-loadingscreen-throbber" data={this.props.throbberImage} type="image/svg+xml">
          Loading...
        </object>
        <h2 className="integr8ly-loadingscreen-text integr8ly-congratulations-heading">{this.props.loadingText}</h2>
        <ProgressBar className="integr8ly-loadingscreen-progressbar" now={this.props.progress} />
        <span className="integr8ly-loadingscreen-progress-label">{this.props.progress}%</span>
      </React.Fragment>
    );
  }
}

LoadingScreen.propTypes = {
  showBackdrop: PropTypes.bool,
  backdropImage: PropTypes.string,
  backdropColor: PropTypes.string,
  backdropOpacity: PropTypes.number,
  progress: PropTypes.number,
  throbberImage: PropTypes.string,
  logo: PropTypes.string,
  loadingText: PropTypes.string,
  hideDelay: PropTypes.number
};

LoadingScreen.defaultProps = {
  hideDelay: 2500,
  showBackdrop: true,
  backdropImage: require('./resources/backdrop.png'),
  backdropColor: '#000',
  backdropOpacity: '1',
  logo: require('./resources/RedHatLogo.png'),
  progress: 0,
  throbberImage: require('./resources/StartingServices_Final.svg'),
  loadingText: 'Loading...'
};

export default LoadingScreen;
