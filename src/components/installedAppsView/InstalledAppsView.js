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

  static getStatusForApp(app) {
    const provisioningStatus = 'Provisioning';
    if (app.status && app.status.conditions && app.status.conditions[0]) {
      return app.status.conditions[0].status === 'True' ? 'Provisioned' : provisioningStatus;
    }
    return provisioningStatus;
  }

  static getRouteForApp(app) {
    if (app.status.dashboardURL) {
      return app.status.dashboardURL;
    }
    if (app.metadata.annotations && app.metadata.annotations['integreatly/dashboard-url']) {
      return app.metadata.annotations['integreatly/dashboard-url'];
    }
    return null;
  }

  static createMasterList(apps) {
    const masterList = apps.map((app, index) => (
      <li
        onClick={() => window.open(InstalledAppsView.getRouteForApp(app), '_blank')}
        key={`${app.spec.clusterServiceClassExternalName}_${index}`}
        value={index}
      >
        <p>{app.spec.clusterServiceClassExternalName}</p>
      </li>
    ));
    return <ul className="app-installed-apps-view-list">{masterList}</ul>;
  }

  render() {
    const appList = InstalledAppsView.createMasterList(this.props.apps);
    return (
      <div className="panel panel-default app-installed-apps-view">
        <div className="panel-heading panel-title app-installed-apps-view-panel-title">
          <h2>Applications</h2>
          <div>{this.props.apps.length} applications</div>
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
      appIcon: PropTypes.string
    })
  ).isRequired
};

export default InstalledAppsView;
