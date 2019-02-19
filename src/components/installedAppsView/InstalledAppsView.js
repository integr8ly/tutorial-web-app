import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';
import { Label, DataList, DataListItem } from '@patternfly/react-core';

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
        <Icon type="fa" name="chart-pie" /> &nbsp;Provisioning
      </div>
    );
    const readyStatus = (
      <div className="integr8ly-state-ready">
        <Icon type="fa" name="bolt" /> &nbsp;Ready for use
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
      <DataList>
        <DataListItem
          className="pf-u-p-md"
          onClick={() => window.open(`${window.OPENSHIFT_CONFIG.masterUri}/console`, '_blank')}
          key={`openshift_console_${index}`}
          value={index}
        >
          <div className="pf-u-display-flex pf-u-flex-direction-column">
            <p className="pf-u-mr-lg">Red Hat OpenShift</p>
            <div className="integr8ly-state-ready">
              <Icon type="fa" name="bolt" /> &nbsp;Ready for use
            </div>
          </div>
        </DataListItem>
      </DataList>
    );
  }

  static createCustomAppElem(i, customApp) {
    return (
      <DataList>
        <DataListItem
          className="pf-u-p-md"
          onClick={() => window.open(`${customApp.url}`, '_blank')}
          key={`openshift_console_${i}`}
          value={i}
        >
          <div className="pf-u-display-flex pf-u-flex-direction-column">
            <p className="pf-u-mr-lg">{customApp.name}</p>
            <Label isCompact>custom</Label>
            <div className="integr8ly-state-ready">
              <Icon type="fa" name="bolt" /> &nbsp;Ready for use
            </div>
          </div>
        </DataListItem>
      </DataList>
    );
  }

  static createMasterList(apps, customApps) {
    const masterList = apps.map((app, index) => {
      const { prettyName, gaStatus } = InstalledAppsView.getProductDetails(app);
      return (
        <DataList>
          <DataListItem
            className="pf-u-p-md"
            onClick={() =>
              prettyName === 'Red Hat AMQ'
                ? window.open(InstalledAppsView.getRouteForApp(app).concat('/console'), '_blank')
                : window.open(InstalledAppsView.getRouteForApp(app), '_blank')
            }
            key={`${app.spec.clusterServiceClassExternalName}_${index}`}
            value={index}
          >
            {' '}
            <div className="pf-u-display-flex pf-u-flex-direction-column">
              <p className="pf-u-mr-lg">
                {prettyName}{' '}
                {gaStatus && (gaStatus === 'preview' || gaStatus === 'community') ? (
                  <Label isCompact>{gaStatus}</Label>
                ) : (
                  <span />
                )}
              </p>
              <div className="integr8ly-state-ready">{InstalledAppsView.getStatusForApp(app)}</div>
            </div>
            <br />
            <small />
          </DataListItem>
        </DataList>
      );
    });
    masterList.unshift(this.getOpenshiftConsole(masterList.length));
    if (customApps) {
      customApps.forEach(app => masterList.push(this.createCustomAppElem(masterList.length, app)));
    }
    return <ul className="integr8ly-installed-apps-view-list pf-u-p-0">{masterList}</ul>;
  }

  render() {
    const appList = InstalledAppsView.createMasterList(this.props.apps, this.props.customApps);
    return (
      <div className="integr8ly-installed-apps-view pf-u-mb-0">
        <div className="integr8ly-installed-apps-view-panel-title pf-u-mt-sm pf-u-display-flex">
          <h2 className="pf-c-title pf-m-3xl pf-u-mt-sm pf-u-mb-sm pf-u-ml-md">Applications</h2>
          <div className="pf-u-mt-md pf-u-pr-sm pf-m-sm pf-u-text-align-right">
            <strong>{appList.props.children.length} applications</strong>
          </div>
        </div>
        {appList}
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
  ).isRequired,
  customApps: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string
    })
  ).isRequired
};

export default InstalledAppsView;
