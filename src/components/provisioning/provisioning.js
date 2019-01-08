import * as React from 'react';
import PropTypes from 'prop-types';
import { ProgressBar, noop } from 'patternfly-react';
import get from 'lodash.get';
import { connect } from '../../redux';
import { getCustomConfig, manageMiddlewareServices, mockMiddlewareServices } from '../../services/middlewareServices';
import { currentUser } from '../../services/openshiftServices';
import { DEFAULT_SERVICES } from '../../common/serviceInstanceHelpers';
import { getWalkthroughServiceInfo } from '../../common/walkthroughServiceHelpers';

const PROVISION_SERVICES = [
  DEFAULT_SERVICES.AMQ,
  DEFAULT_SERVICES.ENMASSE,
  DEFAULT_SERVICES.CHE,
  DEFAULT_SERVICES.LAUNCHER,
  DEFAULT_SERVICES.FUSE,
  DEFAULT_SERVICES.APICURIO
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

    static getMiddlwareServiceProgress(services, toProvision) {
      const servicesToProvision = toProvision || PROVISION_SERVICES;
      const svcNames = Provisioning.getProvisionedMiddlewareServices(services, toProvision);
      return (svcNames.length / servicesToProvision.length) * 100;
    }

    static getProvisionedMiddlewareServices(services, toProvision) {
      const servicesToProvision = toProvision || PROVISION_SERVICES;
      return servicesToProvision
        .map(svcName => {
          const svc = Provisioning.getServiceInstanceByClassName(services, svcName);
          if (!svc || !Provisioning.isMiddlewareServiceProvisioned(svc)) {
            return null;
          }
          return svc;
        })
        .filter(svc => !!svc);
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

    static loadingScreen(services, servicesToProvision) {
      const provisionProgress = Math.ceil(Provisioning.getMiddlwareServiceProgress(services, servicesToProvision));
      return (
        <div className="integr8ly-loadingscreen">
          <div className="integr8ly-loadingscreen-backdrop">
            <div className="integr8ly-loadingscreen-logo" />
          </div>
          <object
            className="integr8ly-loadingscreen-throbber"
            data={require('./StartingServices_Final.svg')}
            type="image/svg+xml"
          >
            Loading...
          </object>
          <h2 className="integr8ly-loadingscreen-text integr8ly-congratulations-heading">
            We&#39;re putting the finishing touches on your new environment. Please stand by.
          </h2>
          <div className="integr8ly-loadingscreen-progress">
            <ProgressBar className="integr8ly-loadingscreen-progressbar" now={provisionProgress} />
            <span className="integr8ly-loadingscreen-progress-label">{provisionProgress}%</span>
          </div>
          <div className="row">
            <div className="list-group list-view-pf list-view-pf-equalized-column integr8ly-provisioning_list-view pf-u-mb-0">
              <div className="list-group-item">
                <div className="list-view-pf-main-info">
                  <div className="list-view-pf-left">
                    <i className="pficon pficon-on-running integr8ly-status-ready" />
                  </div>
                  <div className="list-view-pf-body">
                    <div className="list-view-pf-description">
                      <div className="list-group-item-heading integr8ly-status-ready">Ready to use</div>
                      <div className="list-group-item-text">Red Hat OpenShift</div>
                    </div>
                    <div className="list-view-pf-additional-info">
                      <div className="list-view-pf-additional-info-item" style={{ width: '100%' }}>
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    static renderServiceLoadingLabels(svc) {
      const { gaStatus } = getWalkthroughServiceInfo(svc);
      if (gaStatus === 'preview' || gaStatus === 'community') {
        return <span className={`integr8ly-label-${gaStatus}`}>{gaStatus}</span>;
      }
      return null;
    }

    static renderServiceLoadingIcon(svc) {
      if (svc.status.provisionStatus === 'Provisioned') {
        return <i className="pficon pficon-on-running integr8ly-status-ready" />;
      }
      return <div className="spinner spinner-inverse" />;
    }

    static renderServiceLoadingText(svc) {
      if (svc.status.provisionStatus === 'Provisioned') {
        return <div className="list-group-item-heading integr8ly-status-ready">Ready to use</div>;
      }
      return <div className="list-group-item-heading">Provisioning</div>;
    }

    static renderServiceLoadingBar(svc) {
      return (
        <div className="list-group-item" key={svc.metadata.name}>
          <div className="list-view-pf-main-info">
            <div className="list-view-pf-left">{Provisioning.renderServiceLoadingIcon(svc)}</div>
            <div className="list-view-pf-body">
              <div className="list-view-pf-description">
                {Provisioning.renderServiceLoadingText(svc)}
                <div className="list-group-item-text">
                  {svc.productDetails.prettyName}
                  {Provisioning.renderServiceLoadingLabels(svc)}
                </div>
              </div>
              <div className="list-view-pf-additional-info">
                <div className="list-view-pf-additional-info-item" style={{ width: '100%' }}>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    static newLoadingScreen(services) {
      return (
        <div className="integr8ly-container">
          <div className="container-fluid">
            <div className="row" />
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
                      {services.map(Provisioning.renderServiceLoadingBar)}
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
          ) && Provisioning.newLoadingScreen(Object.values(middlewareServices.data))}
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
