import * as React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'patternfly-react';
import get from 'lodash.get';
import { connect } from '../../redux';
import {
  PROVISION_SERVICES,
  getCustomConfig,
  manageMiddlewareServices,
  mockMiddlewareServices
} from '../../services/middlewareServices';
import { currentUser } from '../../services/openshiftServices';
import ProvisioningScreen from './provisioningScreen';
import { findServices } from '../../common/serviceInstanceHelpers';

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

    render() {
      const { middlewareServices } = this.props;
      if (!Provisioning.areMiddlewareServicesReady(
        Object.values(middlewareServices.data),
        this.state.servicesToProvision
      )) {
        const svcToWatch = findServices(this.state.servicesToProvision || PROVISION_SERVICES, Object.values(middlewareServices.data));
        return <ProvisioningScreen provisioningServices={svcToWatch || []}/>
      }
      return <WrappedComponent/>
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
