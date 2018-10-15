import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';

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

  static getProductDetails(app) {
    const { productDetails, spec } = app;
    if (productDetails) {
      return productDetails;
    }
    return {
      prettyName: spec.clusterServiceClassExternalName
    };
  }

  static getStatusForApp(app) {
    const provisioningStatus = (
      <div className="integr8ly-state-provisioining">
        <Icon type="fa" name="pie-chart" /> &nbsp;Provisioning
      </div>
    );
    const readyStatus = (
      <div className="integr8ly-state-ready">
        <Icon type="pf" name="on-running" /> &nbsp;Ready for use
      </div>
    );
    const unavailableStatus = (
      <div className="integr8ly-state-unavailable">
        <Icon type="pf" name="error-circle-o" /> &nbsp;Unavailable
      </div>
    );

    if (app.metadata && app.metadata.deletionTimestamp) {
      return unavailableStatus;
    }

    if (app.status && app.status.conditions && app.status.conditions[0]) {
      if (app.status.provisionStatus === 'NotProvisioned') {
        return unavailableStatus;
      }
      return app.status.conditions[0].status === 'True' ? readyStatus : provisioningStatus;
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

  static getOpenshiftConsole(index) {
    return (
      <li
        onClick={() => window.open(`${window.OPENSHIFT_CONFIG.masterUri}/console`, '_blank')}
        key={`openshift_console_${index}`}
        value={index}
      >
        <p>Red Hat OpenShift</p>
        <div className="integr8ly-state-ready">
          <Icon type="pf" name="on-running" /> &nbsp;Ready for use
        </div>
      </li>
    );
  }

  static createMasterList(apps) {
    const masterList = apps.map((app, index) => {
      const { prettyName, gaStatus } = InstalledAppsView.getProductDetails(app);
      return (
        <li
          onClick={() => window.open(InstalledAppsView.getRouteForApp(app), '_blank')}
          key={`${app.spec.clusterServiceClassExternalName}_${index}`}
          value={index}
        >
          <div className="integr8ly-installed-apps-view-title">
            <p>{prettyName}</p>
            <span className={`gastatus integr8ly-label-${gaStatus}`}>{gaStatus}</span>
          </div>
          {InstalledAppsView.getStatusForApp(app)}
          <small />
        </li>
      );
    });
    masterList.unshift(this.getOpenshiftConsole(masterList.length));
    return <ul className="integr8ly-installed-apps-view-list">{masterList}</ul>;
  }

  render() {
    const appList = InstalledAppsView.createMasterList(this.props.apps);
    return (
      <div className="panel panel-default integr8ly-installed-apps-view">
        <div className="panel-heading panel-title integr8ly-installed-apps-view-panel-title">
          <h3>Applications</h3>
          <div>{appList.props.children.length} applications</div>
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
