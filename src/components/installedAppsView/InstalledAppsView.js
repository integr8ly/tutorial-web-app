import React from 'react';
import PropTypes from 'prop-types';

class InstalledAppsView extends React.Component {
  state = {
    currentApp: undefined
  };

  constructor(props) {
    super(props);
    this.state.currentApp = 0;
    this.handleAppNameClicked = this.handleAppNameClicked.bind(this);
  }

  handleAppNameClicked(e) {
    this.setState({ currentApp: e.target.value });
  }
  static createMasterList(apps) {
    const masterList = apps.map((app, index) => (
      <li onClick={() => window.open(app.appLink, '_blank')} key={`${app.appName}_${index}`} value={index}>
        <h3>{app.appName}</h3>
        <p>{app.appDescription}</p>
      </li>
    ));
    return <ul className="app-installed-apps-view-list">{masterList}</ul>;
  }

  render() {
    const appList = InstalledAppsView.createMasterList(this.props.apps);
    return (
      <div className="panel panel-default app-installed-apps-view">
        <div className="panel-heading panel-title">
          <h2 className="pull-left">Available Application Services</h2>
          <div className="pull-right">{this.props.apps.length} services</div>
        </div>
        <div className="panel-content">{appList}</div>
      </div>
    );
  }
}

InstalledAppsView.propTypes = {
  apps: PropTypes.arrayOf(
    PropTypes.shape({
      appName: PropTypes.string,
      appDescription: PropTypes.string
    })
  ).isRequired
};

export default InstalledAppsView;
