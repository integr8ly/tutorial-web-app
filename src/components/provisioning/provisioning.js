import * as React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'patternfly-react';
import {
  DataList,
  DataListItem,
  DataListCell,
  Label,
  Progress,
  ProgressMeasureLocation,
  ProgressSize
} from '@patternfly/react-core';
import { BoxesIcon, CircleNotchIcon } from '@patternfly/react-icons';
import get from 'lodash.get';
import { connect } from '../../redux';
import { getCustomConfig, manageMiddlewareServices, mockMiddlewareServices } from '../../services/middlewareServices';
import { currentUser } from '../../services/openshiftServices';
import { DEFAULT_SERVICES } from '../../common/serviceInstanceHelpers';
import {
  getWalkthroughServiceInfo,
  isServiceProvisioned,
  isServiceProvisioning,
  isServiceProvisionFailed,
  getServiceProvisionMessage
} from '../../common/walkthroughServiceHelpers';

const PROVISION_SERVICES = [
  DEFAULT_SERVICES.ENMASSE,
  DEFAULT_SERVICES.CHE,
  DEFAULT_SERVICES.LAUNCHER,
  DEFAULT_SERVICES.FUSE,
  DEFAULT_SERVICES.APICURIO,
  DEFAULT_SERVICES.THREESCALE
];

function buildProvisioningScreen(WrappedComponent) {
  class Provisioning extends React.Component {
    state = { servicesToProvision: PROVISION_SERVICES };

    componentDidMount() {
      const { getCustomConfigForUser, manageWalkthroughServices, mockWalkthroughServices } = this.props;
      if (window.OPENSHIFT_CONFIG.mockData) {
        getCustomConfigForUser({ username: 'mockUser' }).then(() =>
          mockWalkthroughServices(window.OPENSHIFT_CONFIG.mockData)
        );
        return;
      }
      currentUser().then(user => {
        getCustomConfigForUser(user).then(config => {
          this.setState({ servicesToProvision: config.servicesToProvision });
          manageWalkthroughServices(user, config);
        });
      });
    }

    static areMiddlewareServicesReady(services, toProvision) {
      const servicesToProvision = toProvision || PROVISION_SERVICES;
      for (const svcName of servicesToProvision) {
        const svc = Provisioning.getServiceInstanceByClassName(services, svcName);
        if (!svc || !Provisioning.isMiddlewareServiceProvisioned(svc)) {
          return false;
        }
      }
      return true;
    }

    static getServiceInstanceByClassName(services, classToFind) {
      return services.find(svc => get(svc, 'spec.clusterServiceClassExternalName') === classToFind);
    }

    static isMiddlewareServiceProvisioned(svc) {
      // if (svc.status && svc.status.conditions && svc.status.conditions[0]) {
      //   return svc.status.conditions[0].status === 'True';
      // }
      return false;
    }

    static renderServiceLoadingLabels(svc) {
      const { gaStatus } = getWalkthroughServiceInfo(svc);
      if (gaStatus === 'preview' || gaStatus === 'community') {
        return <Label isCompact>{gaStatus}</Label>;
      }
      return null;
    }

    static renderServiceLoadingIcon(svc) {
      // if (isServiceProvisioned(svc)) {
      //   return <i className="pficon pficon-on-running integr8ly-status-ready" />;
      // }
      // if (isServiceProvisioning(svc)) {
      return (
        <div className="integr8ly-provisioning-spinner">
          <CircleNotchIcon className="fa-spin" />{' '}
          <span className="integr8ly-provisioning-spinner-text"> Provisioning</span>
        </div>
      );
      // }
      // if (isServiceProvisionFailed(svc)) {
      //   return <div className="pficon pficon-error-circle-o" />;
      // }
      // return null;
    }

    static renderServiceLoadingText(svc) {
      if (isServiceProvisioned(svc)) {
        return <div className="list-group-item-heading">Ready to use</div>;
      }
      if (isServiceProvisioning(svc)) {
        return <div className="list-group-item-heading">Provisioning</div>;
      }
      if (isServiceProvisionFailed(svc)) {
        return <div className="list-group-item-heading integr8ly-status-error">Error</div>;
      }
      return null;
    }

    static renderServiceLoadingBar(svc) {
      if (isServiceProvisioned(svc)) {
        return <Progress value={100} measureLocation={ProgressMeasureLocation.outside} size={ProgressSize.lg} />;
      }
      if (isServiceProvisionFailed(svc)) {
        return (
          <div className="integr8ly-status-error">Unable to provision. Please contact your Red Hat representative.</div>
        );
      }
      // if (isServiceProvisioning(svc)) {
      return <Progress value={60} measureLocation={ProgressMeasureLocation.outside} size={ProgressSize.lg} />;
      // }
      // return null;
    }

    static renderServiceStatusBar(svc) {
      //   <div
      //   className={`list-group-item ${isProvisionFailed ? 'list-group-error-item' : null}`}
      //   key={svc.spec.clusterServiceClassExternalName}
      // >
      //   <div className="list-group-item-header">
      //     <div className="list-view-pf-main-info">
      //       <div className="list-view-pf-left">{Provisioning.renderServiceLoadingIcon(svc)}</div>
      //       <div className="list-view-pf-body">
      //         <div className="list-view-pf-description">
      //           {Provisioning.renderServiceLoadingText(svc)}
      //           <div className={`list-group-item-text ${isProvisionFailed ? 'integr8ly-status-error' : null}`}>
      //             {svc.productDetails.prettyName}
      //             {Provisioning.renderServiceLoadingLabels(svc)}
      //           </div>
      //         </div>
      //         <div className="list-view-pf-additional-info">
      //           <div className="list-view-pf-additional-info-item" style={{ width: '100%' }}>
      //             {Provisioning.renderServiceLoadingBar(svc)}
      //           </div>
      //         </div>
      //       </div>
      //     </div>
      //   </div>
      //   <div
      //     className={`list-group-item-container container-fluid list-group-error-item list-group-error-item list-group-error ${
      //       !isProvisionFailed ? 'hidden' : null
      //     }`}
      //   >
      //     {getServiceProvisionMessage(svc)}
      //   </div>
      // </div>
      const isProvisionFailed = isServiceProvisionFailed(svc);
      return (
        <DataListItem
          className={`${isProvisionFailed ? 'list-group-error-item' : null}`}
          key={svc.spec.clusterServiceClassExternalName}
        >
          <DataListCell>{Provisioning.renderServiceLoadingIcon(svc)}</DataListCell>
          <DataListCell>
            {Provisioning.renderServiceLoadingText(svc)}
            <div className={` ${isProvisionFailed ? 'integr8ly-status-error' : null}`}>
              {svc.productDetails.prettyName}
              {Provisioning.renderServiceLoadingLabels(svc)}
            </div>
          </DataListCell>
          <DataListCell>{Provisioning.renderServiceLoadingBar(svc)}</DataListCell>
        </DataListItem>
      );
    }

    static renderLoadingScreen(services) {
      return (
        <div>
          <h2 className="pf-c-title pf-m-xl integr8ly-provisioning_heading">
            <BoxesIcon className="integr8ly-provissioning-icon" /> <br />
            Provisioning services for your new environment.
          </h2>
          <DataList aria-label="Simple data list example">{services.map(Provisioning.renderServiceStatusBar)}</DataList>
        </div>
      );
    }

    render() {
      const { middlewareServices } = this.props;
      return (
        <div>
          {!Provisioning.areMiddlewareServicesReady(
            Object.values(middlewareServices.data),
            this.state.servicesToProvision
          ) && Provisioning.renderLoadingScreen(Object.values(middlewareServices.data))}
          {Provisioning.areMiddlewareServicesReady(
            Object.values(middlewareServices.data),
            this.state.servicesToProvision
          ) && <WrappedComponent />}
        </div>
      );
    }
  }

  Provisioning.propTypes = {
    manageWalkthroughServices: PropTypes.func,
    mockWalkthroughServices: PropTypes.func,
    middlewareServices: PropTypes.object,
    getCustomConfigForUser: PropTypes.func
  };

  Provisioning.defaultProps = {
    manageWalkthroughServices: noop,
    mockWalkthroughServices: noop,
    getCustomConfigForUser: noop,
    middlewareServices: { data: {} }
  };

  const mapDispatchToProps = dispatch => ({
    manageWalkthroughServices: (user, config) => manageMiddlewareServices(dispatch, user, config),
    mockWalkthroughServices: mockData => mockMiddlewareServices(dispatch, mockData),
    getCustomConfigForUser: user => getCustomConfig(dispatch, user)
  });

  const mapStateToProps = state => ({
    ...state.middlewareReducers
  });

  const ConnectedProvisioning = connect(
    mapStateToProps,
    mapDispatchToProps
  )(Provisioning);

  return ConnectedProvisioning;
}

export { buildProvisioningScreen as default, buildProvisioningScreen };
