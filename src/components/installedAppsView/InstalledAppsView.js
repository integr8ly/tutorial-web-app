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

  static createMasterList(apps) {
    const masterList = apps.map((app, index) => (
      <li
        onClick={() => window.open(app.status.dashboardURL, '_blank')}
        key={`${app.spec.clusterServiceClassExternalName}_${index}`}
        value={index}
      >
        <h3>
          {app.spec.clusterServiceClassExternalName}
          <i className="fa fa-external-link" />
        </h3>
        <p>{InstalledAppsView.getStatusForApp(app)}</p>
      </li>
    ));
    return <ul className="app-installed-apps-view-list">{masterList}</ul>;
  }

  render() {
    const appList = InstalledAppsView.createMasterList(this.props.apps);
    return (
      <div className="panel panel-default app-installed-apps-view">
        <div className="panel-heading panel-title app-installed-apps-view-panel-title">
          <h2>Experience application services</h2>
          <div>{this.props.apps.length} services</div>
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
      appIcon: PropTypes.string,
      appDescription: PropTypes.string
    })
  ).isRequired
};

export default InstalledAppsView;
