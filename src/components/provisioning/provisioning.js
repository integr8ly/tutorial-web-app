import * as React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'patternfly-react';
import get from 'lodash.get';
import { connect } from '../../redux';
import {
  getCustomConfig,
  manageMiddlewareServices,
  mockMiddlewareServices,
  getServicesToProvision,
  manageServicesV4
} from '../../services/middlewareServices';
import { currentUser } from '../../services/openshiftServices';
import ProvisioningScreen from './provisioningScreen';
import { findServices } from '../../common/serviceInstanceHelpers';
import { isOpenShift4 } from '../../common/openshiftHelpers';
import { SERVICE_STATUSES } from '../../redux/constants/middlewareConstants';

function buildProvisioningScreen(WrappedComponent) {
  class Provisioning extends React.Component {
    state = { servicesToProvision: getServicesToProvision() };

    componentDidMount() {
      const {
        getCustomConfigForUser,
        manageWalkthroughServices,
        prepareServicesV4,
        mockWalkthroughServices
      } = this.props;
      if (window.OPENSHIFT_CONFIG.mockData) {
        getCustomConfigForUser({ username: 'mockUser' }).then(() =>
          mockWalkthroughServices(window.OPENSHIFT_CONFIG.mockData)
        );
        return;
      }
      currentUser().then(user => {
        getCustomConfigForUser(user).then(config => {
          this.setState({ servicesToProvision: config.servicesToProvision });
          const manageFn = isOpenShift4() ? prepareServicesV4 : manageWalkthroughServices;
          manageFn(user, config);
        });
      });
    }

    // OpenShift 4 equivalent of #areMiddlewareServicesReady
    static areServicesReadyV4(services, toProvision) {
      const completeToProvision = toProvision || getServicesToProvision();
      for (const svcName of completeToProvision) {
        const svc = services.find(s => s.name === svcName);
        if (!svc || svc.status !== SERVICE_STATUSES.PROVISIONED) {
          return false;
        }
      }
      return true;
    }

    static areMiddlewareServicesReady(services, toProvision) {
      const servicesToProvision = toProvision || getServicesToProvision();
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

    render() {
      const { middlewareServices } = this.props;
      const readinessCheckFn = isOpenShift4()
        ? Provisioning.areServicesReadyV4
        : Provisioning.areMiddlewareServicesReady;
      if (!readinessCheckFn(Object.values(middlewareServices.data), this.state.servicesToProvision)) {
        const svcToWatch = findServices(
          this.state.servicesToProvision || getServicesToProvision(),
          Object.values(middlewareServices.data)
        );
        return <ProvisioningScreen provisioningServices={svcToWatch || []} />;
      }
      return <WrappedComponent />;
    }
  }

  Provisioning.propTypes = {
    manageWalkthroughServices: PropTypes.func,
    prepareServicesV4: PropTypes.func,
    mockWalkthroughServices: PropTypes.func,
    middlewareServices: PropTypes.object,
    getCustomConfigForUser: PropTypes.func
  };

  Provisioning.defaultProps = {
    manageWalkthroughServices: noop,
    prepareServicesV4: noop,
    mockWalkthroughServices: noop,
    getCustomConfigForUser: noop,
    middlewareServices: { data: {} }
  };

  const mapDispatchToProps = dispatch => ({
    manageWalkthroughServices: (user, config) => manageMiddlewareServices(dispatch, user, config),
    prepareServicesV4: (user, config) => manageServicesV4(dispatch, user, config),
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
