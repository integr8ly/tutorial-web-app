import React from 'react';
import PropTypes from 'prop-types';
import { Badge, DataList, DataListItem, Button } from '@patternfly/react-core';
import { ChartPieIcon, ErrorCircleOIcon, OnRunningIcon, OffIcon } from '@patternfly/react-icons';
import { getProductDetails } from '../../services/middlewareServices';

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

  static isServiceUnready(svc) {
    return !svc.metadata;
  }

  static isServiceProvisioned(svc) {
    return (
      svc.status && svc.status.conditions && svc.status.conditions[0] && svc.status.conditions[0].status === 'True'
    );
  }

  static getStatusForApp(app) {
    const provisioningStatus = (
      <div className="integr8ly-state-provisioining">
        <ChartPieIcon /> &nbsp;Provisioning
      </div>
    );
    const readyStatus = (
      <div className="integr8ly-state-ready">
        <OnRunningIcon /> &nbsp;Ready for use
      </div>
    );
    const unavailableStatus = (
      <div className="integr8ly-state-unavailable">
        <ErrorCircleOIcon /> &nbsp;Unavailable
      </div>
    );
    const unreadyStatus = (
      <div className="integr8ly-state-provisioining">
        <OffIcon /> &nbsp;Not ready
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
    return unreadyStatus;
  }

  static getRouteForApp(app) {
    if (app.status.dashboardURL) {
      return app.status.dashboardURL;
    }
    if (app.metadata && app.metadata.annotations && app.metadata.annotations['integreatly/dashboard-url']) {
      return app.metadata.annotations['integreatly/dashboard-url'];
    }
    return null;
  }

  static getOpenshiftConsole(index) {
    return (
      <DataList aria-label="openshift-console-datalist" key="openshift_console">
        <DataListItem
          className="pf-u-p-md integr8ly-installed-apps-view-list-item-enabled"
          onClick={() => window.open(`${window.OPENSHIFT_CONFIG.masterUri}/console`, '_blank')}
          key={`openshift_console_${index}`}
          value={index}
          aria-labelledby={`openshift-console-datalistitem-${index}`}
        >
          <div className="pf-u-display-flex pf-u-flex-direction-column">
            <p>Red Hat OpenShift</p>
            <div className="integr8ly-state-ready">
              <OnRunningIcon /> &nbsp;Ready for use
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
          className="pf-u-p-md integr8ly-installed-apps-view-list-item-enabled"
          onClick={() => window.open(`${customApp.url}`, '_blank')}
          key={`openshift_console_${i}`}
          value={i}
        >
          <div className="pf-u-display-flex pf-u-flex-direction-column">
            <p>
              {customApp.name}
              <Badge isRead className="pf-u-ml-lg">
                custom
              </Badge>
            </p>
            <div className="integr8ly-state-ready">
              <OnRunningIcon /> &nbsp;Ready for use
            </div>
          </div>
        </DataListItem>
      </DataList>
    );
  }

  handleLaunchClicked(svc) {
    this.props.handleLaunch(svc.spec.clusterServiceClassExternalName);
  }

  static createMasterList(displayServices, apps, customApps, enableLaunch, launchHandler) {
    const completeSvcNames = apps
      .map(svc => {
        if (!svc.spec || !svc.spec.clusterServiceClassExternalName) {
          return null;
        }
        return svc.spec.clusterServiceClassExternalName;
      })
      .filter(svcName => !!svcName)
      .concat(displayServices);

    const completeSvcList = [...new Set(completeSvcNames)].map(svcName => {
      const provisionedSvc = apps.find(svc => svc.spec.clusterServiceClassExternalName === svcName);
      if (!provisionedSvc) {
        return {
          spec: {
            clusterServiceClassExternalName: svcName
          },
          status: {
            dashboardURL: null
          }
        };
      }
      return provisionedSvc;
    });

    const masterList = completeSvcList
      .sort((cur, next) => {
        const curDetails = getProductDetails(cur);
        const nextDetails = getProductDetails(next);
        // Try to push any non-pretty names to the bottom. Although, all names
        // should be pretty in this section.
        if (!curDetails || nextDetails.prettyName > curDetails.prettyName) {
          return -1;
        }
        if (!nextDetails || curDetails.prettyName > nextDetails.prettyName) {
          return 1;
        }
        return 0;
      })
      .map((app, index) => {
        const { prettyName, gaStatus, hidden } = getProductDetails(app);
        return hidden ? null : (
          <DataList aria-label="cluster-services-datalist" key={`${app.spec.clusterServiceClassExternalName}`}>
            <DataListItem
              className={
                InstalledAppsView.isServiceProvisioned(app)
                  ? 'pf-u-p-md integr8ly-installed-apps-view-list-item-enabled'
                  : 'pf-u-p-md'
              }
              onClick={() => {
                if (!InstalledAppsView.getRouteForApp(app) || !InstalledAppsView.isServiceProvisioned(app)) {
                  return;
                }
                prettyName === 'Red Hat AMQ'
                  ? window.open(InstalledAppsView.getRouteForApp(app).concat('/console'), '_blank')
                  : window.open(InstalledAppsView.getRouteForApp(app), '_blank');
              }}
              key={`${app.spec.clusterServiceClassExternalName}_${index}`}
              value={index}
              aria-labelledby={`cluster-service-datalistitem-${index}`}
            >
              {' '}
              <div className="pf-u-display-flex pf-u-justify-content-space-between" style={{ width: '100%' }}>
                <div className="pf-u-flex-direction-column">
                  <p>
                    {prettyName}{' '}
                    {gaStatus && (gaStatus === 'preview' || gaStatus === 'community') ? (
                      <Badge isRead className="pf-u-ml-lg">
                        {gaStatus}
                      </Badge>
                    ) : (
                      <span />
                    )}
                  </p>
                  <div className="integr8ly-state-ready">{InstalledAppsView.getStatusForApp(app)}</div>
                </div>
                {enableLaunch && InstalledAppsView.isServiceUnready(app) ? (
                  <div className="pf-u-display-flex pf-u-justify-content-flex-end">
                    <Button onClick={() => launchHandler(app)} variant="link">
                      Start service
                    </Button>
                  </div>
                ) : null}
              </div>
              <br />
              <small />
            </DataListItem>
          </DataList>
        );
      })
      .filter(app => app != null);
    masterList.unshift(this.getOpenshiftConsole(masterList.length));
    if (customApps) {
      customApps.forEach(app => masterList.push(this.createCustomAppElem(masterList.length, app)));
    }
    return <ul className="integr8ly-installed-apps-view-list pf-u-p-0">{masterList}</ul>;
  }

  render() {
    const appList = InstalledAppsView.createMasterList(
      this.props.showUnready,
      this.props.apps,
      this.props.customApps,
      this.props.enableLaunch,
      this.handleLaunchClicked.bind(this)
    );
    return (
      <div className="integr8ly-installed-apps-view pf-u-mb-0">
        <div className="integr8ly-installed-apps-view-panel-title pf-u-display-flex pf-u-mt-sm pf-u-box-shadow-md">
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
  ).isRequired,
  showUnready: PropTypes.array,
  handleLaunch: PropTypes.func.isRequired,
  enableLaunch: PropTypes.bool
};

InstalledAppsView.defaultProps = {
  showUnready: [],
  enableLaunch: true
};

export default InstalledAppsView;
