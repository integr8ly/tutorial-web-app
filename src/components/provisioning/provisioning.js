import * as React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'patternfly-react';
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
      if (svc.status && svc.status.conditions && svc.status.conditions[0]) {
        return svc.status.conditions[0].status === 'True';
      }
      return false;
    }

    static renderServiceLoadingLabels(svc) {
      const { gaStatus } = getWalkthroughServiceInfo(svc);
      if (gaStatus === 'preview' || gaStatus === 'community') {
        return <span className={`integr8ly-label-${gaStatus}`}>{gaStatus}</span>;
      }
      return null;
    }

    static renderServiceLoadingIcon(svc) {
      if (isServiceProvisioned(svc)) {
        return <i className="pficon pficon-on-running integr8ly-status-ready" />;
      }
      if (isServiceProvisioning(svc)) {
        return <div className="spinner spinner-inverse" />;
      }
      if (isServiceProvisionFailed(svc)) {
        return <div className="pficon pficon-error-circle-o" />;
      }
      return null;
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
        return (
          <div
            className="pf-c-progress pf-m-success"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="100"
            aria-describedby="progress-simple-example-description"
            style={{ width: '100%' }}
          >
            <div className="pf-c-progress__bar">
              <div className="pf-c-progress__indicator" style={{ width: '100%' }} />
            </div>
          </div>
        );
      }
      if (isServiceProvisionFailed(svc)) {
        return (
          <div className="integr8ly-status-error">Unable to provision. Please contact your Red Hat representative.</div>
        );
      }
      if (isServiceProvisioning(svc)) {
        return (
          <div
            className="pf-c-progress"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="100"
            aria-describedby="progress-simple-example-description"
            style={{ width: '100%' }}
          >
            <div className="pf-c-progress__bar">
              <div
                className="pf-c-progress__indicator integr8ly-progress-bar-striped active"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        );
      }
      return null;
    }

    static renderServiceStatusBar(svc) {
      const isProvisionFailed = isServiceProvisionFailed(svc);
      return (
        <div
          className={`list-group-item ${isProvisionFailed ? 'list-group-error-item' : null}`}
          key={svc.spec.clusterServiceClassExternalName}
        >
          <div className="list-group-item-header">
            <div className="list-view-pf-main-info">
              <div className="list-view-pf-left">{Provisioning.renderServiceLoadingIcon(svc)}</div>
              <div className="list-view-pf-body">
                <div className="list-view-pf-description">
                  {Provisioning.renderServiceLoadingText(svc)}
                  <div className={`list-group-item-text ${isProvisionFailed ? 'integr8ly-status-error' : null}`}>
                    {svc.productDetails.prettyName}
                    {Provisioning.renderServiceLoadingLabels(svc)}
                  </div>
                </div>
                <div className="list-view-pf-additional-info">
                  <div className="list-view-pf-additional-info-item" style={{ width: '100%' }}>
                    {Provisioning.renderServiceLoadingBar(svc)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`list-group-item-container container-fluid list-group-error-item list-group-error-item list-group-error ${
              !isProvisionFailed ? 'hidden' : null
            }`}
          >
            {getServiceProvisionMessage(svc)}
          </div>
        </div>
      );
    }

    static renderLoadingScreen(services) {
      return (
        <div className="integr8ly-container">
          <div className="container-fluid">
            <div className="row">
              <div className="integr8ly-module integr8ly-module-provisioning pf-u-mt-0 pf-u-mb-0 col-xs-12">
                <div className="integr8ly-module-column">
                  <div className="integr8ly-module-column--steps integr8ly-provisioning pf-u-p-0 pf-u-m-0">
                    <span className="integr8ly-provisioning_logo" />
                    <span />
                    <span className="integr8ly-provisioning_icon" />
                    <h2 className="pf-c-title pf-m-3xl integr8ly-provisioning_heading">
                      Provisioning services for your new environment.
                    </h2>
                    <div className="list-group list-view-pf list-view-pf-equalized-column integr8ly-provisioning_list-view pf-u-mb-0">
                      {services.map(Provisioning.renderServiceStatusBar)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
