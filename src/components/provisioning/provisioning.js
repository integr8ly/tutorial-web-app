import * as React from 'react';
import PropTypes from 'prop-types';
import { ProgressBar, noop } from 'patternfly-react';
import get from 'lodash.get';
import { connect } from '../../redux';
import { manageMiddlewareServices, mockMiddlewareServices } from '../../services/middlewareServices';
import { DEFAULT_SERVICES } from '../../common/serviceInstanceHelpers';

const PROVISION_SERVICES = [
  DEFAULT_SERVICES.AMQ,
  DEFAULT_SERVICES.ENMASSE,
  DEFAULT_SERVICES.CHE,
  DEFAULT_SERVICES.LAUNCHER,
  DEFAULT_SERVICES.FUSE
];

function buildProvisioningScreen(WrappedComponent) {
  class Provisioning extends React.Component {
    componentDidMount() {
      const { manageWalkthroughServices, mockWalkthroughServices } = this.props;
      if (window.OPENSHIFT_CONFIG.mockData) {
        mockWalkthroughServices(window.OPENSHIFT_CONFIG.mockData);
        return;
      }
      manageWalkthroughServices();
    }

    static getMiddlwareServiceProgress(services) {
      const svcNames = Provisioning.getProvisionedMiddlewareServices(services);
      return (svcNames.length / PROVISION_SERVICES.length) * 100;
    }

    static getProvisionedMiddlewareServices(services) {
      return PROVISION_SERVICES.map(svcName => {
        const svc = Provisioning.getServiceInstanceByClassName(services, svcName);
        if (!svc || !Provisioning.isMiddlewareServiceProvisioned(svc)) {
          return null;
        }
        return svc;
      }).filter(svc => !!svc);
    }

    static areMiddlewareServicesReady(services) {
      for (const svcName of PROVISION_SERVICES) {
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

    static loadingScreen(services) {
      const provisionProgress = Provisioning.getMiddlwareServiceProgress(services);
      return (
        <div>
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
          <ProgressBar className="integr8ly-loadingscreen-progressbar" now={provisionProgress} />
          <span className="integr8ly-loadingscreen-progress-label">{provisionProgress}%</span>
        </div>
      );
    }

    render() {
      const { middlewareServices } = this.props;
      return (
        <div>
          {!Provisioning.areMiddlewareServicesReady(Object.values(middlewareServices.data)) &&
            Provisioning.loadingScreen(Object.values(middlewareServices.data))}
          {Provisioning.areMiddlewareServicesReady(Object.values(middlewareServices.data)) && <WrappedComponent />}
        </div>
      );
    }
  }

  Provisioning.propTypes = {
    manageWalkthroughServices: PropTypes.func,
    mockWalkthroughServices: PropTypes.func,
    middlewareServices: PropTypes.object
  };

  Provisioning.defaultProps = {
    manageWalkthroughServices: noop,
    mockWalkthroughServices: noop,
    middlewareServices: { data: {} }
  };

  const mapDispatchToProps = dispatch => ({
    manageWalkthroughServices: () => manageMiddlewareServices(dispatch),
    mockWalkthroughServices: mockData => mockMiddlewareServices(dispatch, mockData)
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
