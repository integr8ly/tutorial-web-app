import React from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Button,
  DataList,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListCell
} from '@patternfly/react-core';
import { ChartPieIcon, ErrorCircleOIcon, OnRunningIcon, OffIcon } from '@patternfly/react-icons';
import { getProductDetails } from '../../services/middlewareServices';
import { SERVICE_STATUSES, SERVICE_TYPES } from '../../redux/constants/middlewareConstants';

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
    if (svc.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
      return !svc.status === SERVICE_STATUSES.PROVISIONED;
    }

    return !svc.metadata;
  }

  static isServiceProvisioned(svc) {
    if (svc.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
      return svc.status === SERVICE_STATUSES.PROVISIONED;
    }
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
    // Allow for non-Service Instance services
    if (app.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
      if (!app.status || app.status === SERVICE_STATUSES.UNAVAILABLE) {
        return unreadyStatus;
      }
      if (app.status === SERVICE_STATUSES.PROVISIONING) {
        return provisioningStatus;
      }
      if (app.status === SERVICE_STATUSES.PROVISIONED) {
        return readyStatus;
      }
      if (app.status === SERVICE_STATUSES.DELETING) {
        return unavailableStatus;
      }
    }

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
    if (app.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
      return app.url;
    }
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
          className="integr8ly-installed-apps-view-list-item-enabled"
          onClick={() => window.open(`${window.OPENSHIFT_CONFIG.masterUri}/console`, '_blank')}
          key={`openshift_console_${index}`}
          value={index}
          aria-labelledby={`openshift-console-datalistitem-${index}`}
        >
          <DataListItemRow>
            <DataListItemCells
              dataListCells={[
                <DataListCell key="primary content">
                  <span id="Red Hat OpenShift">Red Hat OpenShift</span>
                </DataListCell>,
                <DataListCell key="secondary content" className="pf-u-text-align-right">
                  <div className="integr8ly-state-ready">
                    <OnRunningIcon /> &nbsp;Ready for use
                  </div>
                </DataListCell>
              ]}
            />
          </DataListItemRow>
        </DataListItem>
      </DataList>
    );
  }

  static createCustomAppElem(i, customApp) {
    return (
      <DataList aria-label="OpenShift service item">
        <DataListItem
          className="integr8ly-installed-apps-view-list-item-enabled"
          onClick={() => window.open(`${customApp.url}`, '_blank')}
          key={`openshift_console_${i}`}
          value={i}
          aria-labelledby="OpenShift-service"
        >
          <DataListItemRow>
            <DataListItemCells
              dataListCells={[
                <DataListCell key="primary content">
                  {customApp.name}
                  <Badge isRead className="pf-u-ml-lg">
                    custom
                  </Badge>
                </DataListCell>,
                <DataListCell key="secondary content" className="pf-u-text-align-right">
                  <div className="integr8ly-state-ready">
                    <OnRunningIcon /> &nbsp;Ready for use
                  </div>
                </DataListCell>
              ]}
            />
          </DataListItemRow>
        </DataListItem>
      </DataList>
    );
  }

  handleLaunchClicked(svc) {
    this.props.handleLaunch(svc.spec.clusterServiceClassExternalName);
  }

  static genUniqueKeyForService(svc) {
    return svc.name || svc.spec.clusterServiceClassExternalName;
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
      const provisionedSvc = apps.find(svc => {
        // Allow for non-Service Instance services.
        if (svc.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
          return svc.name === svcName;
        }
        return svc.spec.clusterServiceClassExternalName === svcName;
      });
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
        const uniqKey = InstalledAppsView.genUniqueKeyForService(app);
        return hidden ? null : (
          <DataList aria-label="cluster-services-datalist" key={`${uniqKey}`}>
            <DataListItem
              className={
                InstalledAppsView.isServiceProvisioned(app)
                  ? 'integr8ly-installed-apps-view-list-item-enabled'
                  : '&nbsp;'
              }
              onClick={() => {
                if (!InstalledAppsView.getRouteForApp(app) || !InstalledAppsView.isServiceProvisioned(app)) {
                  return;
                }
                prettyName === 'Red Hat AMQ'
                  ? window.open(InstalledAppsView.getRouteForApp(app).concat('/console'), '_blank')
                  : window.open(InstalledAppsView.getRouteForApp(app), '_blank');
              }}
              key={`${uniqKey}_${index}`}
              value={index}
              aria-labelledby={`cluster-service-datalistitem-${index}`}
            >
              <DataListItemRow>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell key="primary content">
                      <span id="appName">
                        {' '}
                        {prettyName}{' '}
                        {gaStatus && (gaStatus === 'preview' || gaStatus === 'community') ? (
                          <Badge isRead className="pf-u-ml-lg">
                            {gaStatus}
                          </Badge>
                        ) : (
                          <span />
                        )}
                      </span>
                    </DataListCell>,
                    <DataListCell key="secondary content" className="pf-u-text-align-right">
                      <div className="integr8ly-state-ready">{InstalledAppsView.getStatusForApp(app)}</div>
                    </DataListCell>
                  ]}
                />
              </DataListItemRow>
              {enableLaunch && InstalledAppsView.isServiceUnready(app) ? (
                <div className="pf-u-display-flex pf-u-justify-content-flex-end">
                  <Button onClick={() => launchHandler(app)} variant="link">
                    Start service
                  </Button>
                </div>
              ) : null}
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
        <div className="integr8ly-installed-apps-view-panel-title pf-u-display-flex pf-u-align-items-center pf-u-mt-sm pf-u-box-shadow-md">
          <h2 className="pf-c-title pf-m-2xl pf-u-mt-sm pf-u-mb-sm pf-u-ml-md">Applications</h2>
          <div className="pf-u-my-sm pf-u-pr-sm pf-m-sm pf-u-text-align-right">
            <Badge isRead>{appList.props.children.length}</Badge>
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
