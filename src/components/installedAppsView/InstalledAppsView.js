import React from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Button,
  DataList,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListCell,
  Expandable,
  Tooltip
} from '@patternfly/react-core';
import { ChartPieIcon, ErrorCircleOIcon, HelpIcon, OnRunningIcon, OffIcon } from '@patternfly/react-icons';
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

  static getStatusForApp(app, prettyName) {
    const provisioningStatus = (
      <div className="integr8ly-state-provisioining">
        <ChartPieIcon /> &nbsp;Provisioning
      </div>
    );
    const readyStatus = (
      <div className="integr8ly-state-ready">
        <Button
          onClick={() => {
            if (!InstalledAppsView.getRouteForApp(app) || !InstalledAppsView.isServiceProvisioned(app)) {
              return;
            }
            prettyName === 'Red Hat AMQ'
              ? window.open(InstalledAppsView.getRouteForApp(app).concat('/console'), '_blank')
              : window.open(InstalledAppsView.getRouteForApp(app), '_blank');
          }}
          variant="secondary"
        >
          Open console
        </Button>
      </div>
    );
    const unavailableStatus = (
      <div className="integr8ly-state-unavailable">
        <ErrorCircleOIcon /> &nbsp;Unavailable
      </div>
    );
    const unreadyStatus = <span />;

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
      <DataList
        aria-label="OpenShift console datalist"
        key="openshift_console"
        id={`openshift-console-datalistitem-${index}`}
      >
        <DataListItem
          className="integr8ly-installed-apps-view-list-item-enabled"
          key={`openshift_console_${index}`}
          value={index}
          aria-labelledby={`openshift-console-datalistitem-${index}`}
          aria-label={`Installed application list item ${index}`}
        >
          <DataListItemRow>
            <DataListItemCells
              dataListCells={[
                <DataListCell key="manage cluster">
                  <Expandable toggleText="Manage cluster">
                    A single-tenant, high-availability OpenShift cluster, managed by Red Hat.
                  </Expandable>
                </DataListCell>,
                <DataListCell key="primary content">
                  <span className="integr8ly-pretty-name" id="Red Hat OpenShift">Red Hat OpenShift</span>
                </DataListCell>,
                <DataListCell
                  key="cell one"
                  onClick={() =>
                    window.open(
                      `${window.OPENSHIFT_CONFIG.masterUri}/console/project/webapp/browse/secrets/manifest`,
                      '_blank'
                    )
                  }
                >
                  <span id="manifest">
                    {/* TODO: OpenShift Version
                        Using getMasterUri() function: <br />
                        {getMasterUri()}
                        /console/project/webapp/browse/secrets/manifest */}
                  </span>
                </DataListCell>,
                <DataListCell key="secondary content" className="pf-u-text-align-right">
                  <div className="integr8ly-state-ready">
                    <Button
                      onClick={() => window.open(`${window.OPENSHIFT_CONFIG.masterUri}/console`, '_blank')}
                      variant="secondary"
                    >
                      Open console
                    </Button>
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
      <DataList aria-label="OpenShift service item" id={`openshift-service-item-${i}`}>
        <DataListItem
          className="integr8ly-installed-apps-view-list-item-enabled"
          onClick={() => window.open(`${customApp.url}`, '_blank')}
          key={`openshift_console_${i}`}
          value={i}
          aria-labelledby={`openshift-service-item-${i}`}
        >
          <DataListItemRow>
            <DataListItemCells
              dataListCells={[
                <DataListCell key={`primary content ${i}`}>
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
    if (svc.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
      this.props.handleLaunch(svc.name);
      return;
    }
    this.props.handleLaunch(svc.spec.clusterServiceClassExternalName);
  }

  static genUniqueKeyForService(svc) {
    return svc.name || svc.spec.clusterServiceClassExternalName;
  }

  static createMasterList(displayServices, apps, customApps, enableLaunch, launchHandler) {
    // MF 120219 Testing begin
    console.log(`Apps = ${JSON.stringify(apps)}`);
    // Testing end
    const completeSvcNames = apps
      .map(svc => {
        if (svc.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
          return svc.name;
        }
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
    // MF 120219 Testing begin
    console.log(`completeSvcList is: ${JSON.stringify(completeSvcList)}`);
    // Testing end
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
        // MF 120219 Testing begin
        console.log(`App is: ${JSON.stringify(app)}`);
        // Testing end
        const { description, gaStatus, hidden, prettyName, primaryTask } = getProductDetails(app);
        const uniqKey = InstalledAppsView.genUniqueKeyForService(app);
        return hidden ? null : (
          <DataList
            aria-label="Cluster service datalist"
            key={`${
              app.type === SERVICE_TYPES.PROVISIONED_SERVICE ? app.name : app.spec.clusterServiceClassExternalName
            }`}
            id={`cluster-service-datalist-item-${index}`}
          >
            <DataListItem
              className={
                InstalledAppsView.isServiceProvisioned(app)
                  ? 'integr8ly-installed-apps-view-list-item-enabled'
                  : '&nbsp;'
              }
              key={`${uniqKey}_${index}`}
              value={index}
              aria-labelledby={`cluster-service-datalist-item-${index}`}
            >
              <DataListItemRow>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell key={`primary content ${index}`}>
                      <span id={`appName-primary-task-${prettyName}`}>
                        {' '}
                        <Expandable toggleText={primaryTask}>{description}</Expandable>
                      </span>
                    </DataListCell>,
                    <DataListCell key="primary content">
                      <span className="integr8ly-pretty-name" id={`appName-${prettyName}`}>
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
                    <DataListCell
                      key="cell one"
                      onClick={() =>
                        window.open(
                          `${window.OPENSHIFT_CONFIG.masterUri}/console/project/webapp/browse/secrets/manifest`,
                          '_blank'
                        )
                      }
                    >
                      <span id="manifest">
                        {/* TODO: Version
                        Using getMasterUri() function: <br />
                        {getMasterUri()}
                        /console/project/webapp/browse/secrets/manifest */}
                      </span>
                    </DataListCell>,

                    <DataListCell key="secondary content" className="pf-u-text-align-right">
                      <div className="integr8ly-state-ready">{InstalledAppsView.getStatusForApp(app, prettyName)}</div>
                      {enableLaunch && InstalledAppsView.isServiceUnready(app) ? (
                        // <div className="pf-u-display-flex pf-u-justify-content-flex-end">
                        <div className="integr8ly-state-provisioining">
                          <Button onClick={() => launchHandler(app)} variant="secondary">
                            <OffIcon />
                            &nbsp; Start service
                          </Button>
                        </div>
                      ) : null}
                    </DataListCell>
                  ]}
                />
              </DataListItemRow>
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
    const managedTooltip = 'Managed services are delivered as a hosted service and supported by Red Hat.';
    // const selfManagedTooltip = 'Self-managed services are available for use, but not managed by Red Hat.';

    // MF 120219 Testing begin
    console.log(appList);
    console.log(this.props.apps);
    // Testing end

    return (
      <div>
        <div className="integr8ly-tutorial-dashboard-title pf-l-flex pf-u-py-sm">
          <span className="pf-l-flex pf-m-inline-flex">
            <h2 className="pf-c-title pf-m-2xl pf-u-mt-sm pf-u-mb-sm pf-u-ml-md">Managed services</h2>
            <Tooltip position="top" content={<div>{managedTooltip}</div>}>
              <span>
                <HelpIcon className="pf-u-mt-sm integr8ly-dev-resources-icon" />
              </span>
            </Tooltip>
          </span>

          <div className="pf-l-flex__item pf-m-align-right">
            <Badge className="integr8ly-dash-badge" isRead>
              {appList.props.children.length}
            </Badge>{' '}
          </div>
        </div>
        <div className="integr8ly-installed-apps-view pf-u-mb-0">
          <div className="integr8ly-installed-apps-view-panel-title pf-u-display-flex pf-u-align-items-center pf-u-mt-sm pf-u-box-shadow-md" />
          {appList}
        </div>
        {/* 
        <div className="integr8ly-tutorial-dashboard-title pf-l-flex pf-u-py-sm">
          <span className="pf-l-flex pf-m-inline-flex">
            <h2 className="pf-c-title pf-m-2xl pf-u-mt-sm pf-u-mb-sm pf-u-ml-md">Self-managed services</h2>
            <Tooltip position="top" content={<div>{selfManagedTooltip}</div>}>
              <span>
                <HelpIcon className="pf-u-mt-sm integr8ly-dev-resources-icon" />
              </span>
            </Tooltip>
          </span>

          <div className="pf-l-flex__item pf-m-align-right">
            <Badge className="integr8ly-dash-badge" isRead>
              0
            </Badge>{' '}
          </div>
        </div>
        <div className="integr8ly-installed-apps-view pf-u-mb-0">
          <div className="integr8ly-installed-apps-view-panel-title pf-u-display-flex pf-u-align-items-center pf-u-mt-sm pf-u-box-shadow-md" />
          {appList}
        </div> 
        */}
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
