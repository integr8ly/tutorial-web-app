import { watch, OpenShiftWatchEvents } from './openshiftServices';
import { middlewareTypes } from '../redux/constants';
import { FULFILLED_ACTION } from '../redux/helpers';
import {
  buildServiceInstanceCompareFn,
  buildServiceInstanceResourceObj,
  DEFAULT_SERVICES
} from '../common/serviceInstanceHelpers';
import {
  getUsersSharedNamespaceName,
  getUsersSharedNamespaceDisplayName,
  cleanUsername,
  findOrCreateOpenshiftResource
} from '../common/openshiftHelpers';
import {
  namespaceResource,
  namespaceRequestResource,
  namespaceDef,
  namespaceRequestDef,
  serviceInstanceDef,
  statefulSetDef
} from '../common/openshiftResourceDefinitions';

import productDetails from '../product-info';
import { SERVICE_TYPES } from '../redux/constants/middlewareConstants';
import { watchAMQOnline } from './amqOnlineServices';

// The default services to watch.
const WATCH_SERVICES = [
  DEFAULT_SERVICES.CHE,
  DEFAULT_SERVICES.LAUNCHER,
  DEFAULT_SERVICES.THREESCALE,
  DEFAULT_SERVICES.APICURIO,
  DEFAULT_SERVICES.FUSE_MANAGED,
  DEFAULT_SERVICES.FUSE,
  DEFAULT_SERVICES.ENMASSE,
  DEFAULT_SERVICES.RHSSO
];

// The default services to show in any user-facing manner, even if they aren't
// available. This is the opposite of the "hidden" flag in product info.
const DISPLAY_SERVICES = [DEFAULT_SERVICES.ENMASSE];

// The default services to provision.
const PROVISION_SERVICES = [
  DEFAULT_SERVICES.CHE,
  DEFAULT_SERVICES.LAUNCHER,
  DEFAULT_SERVICES.APICURIO,
  DEFAULT_SERVICES.THREESCALE,
  DEFAULT_SERVICES.FUSE_MANAGED,
  DEFAULT_SERVICES.RHSSO
];

/**
 * Lookup product details (name and GA status) and add them to the
 * service instance object
 * @param serviceInstance Service instance retrieved from Openshift
 */
const getProductDetails = svc => {
  if (!svc) {
    return null;
  }
  if (svc.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
    return getProductDetailsForService(svc);
  }
  return getProductDetailsForServiceClass(svc.spec.clusterServiceClassExternalName);
};

const getProductDetailsForService = svc => {
  const storedDetails = productDetails[svc.name];
  return !storedDetails ? { prettyName: svc.name } : storedDetails;
};

const getProductDetailsForServiceClass = serviceClassName => {
  const storedDetails = productDetails[serviceClassName];
  if (!storedDetails) {
    return {
      prettyName: serviceClassName
    };
  }
  return storedDetails;
};

/**
 * Dispatch a mock set of user services.
 * @param {Object} dispatch Redux dispatch.
 * @param {Object} mockData The mock data to dispatch.
 */
const mockMiddlewareServices = (dispatch, mockData) => {
  if (!mockData || !mockData.serviceInstances) {
    return;
  }
  const mockUsername = 'mockuser';
  window.localStorage.setItem('currentUserName', mockUsername);
  mockData.serviceInstances.forEach(si => {
    dispatch({
      type: FULFILLED_ACTION(middlewareTypes.CREATE_WALKTHROUGH),
      payload: si
    });
  });
};

/**
 * Manage the current authenticated users walkthrough. This performs a number
 * of initialization tasks and then some long-running tasks.
 *
 * Initialization tasks:
 * - Setup a user-specific projects namespace if it doesn't already exist. This
 *   will house the users services.
 * - Provision one of each of the services from the Service Catalog into the
 *   projects namespace.
 *
 * Long-running tasks:
 * - Watch all ServiceInstances in the namespace and handle any events that
 *   occur on them. This is usually for checking whether the ServiceInstance is
 *   provisioned or not, but it can also be setting up other related resources.
 * - Watch the AMQ StatefulSet. This is a temporary task that is used to set up
 *   a Secret containing the credentials of AMQ.
 * @param {Object} dispatch Redux dispatch.
 */
const manageMiddlewareServices = (dispatch, user, config) => {
  const walkthroughServices = config.servicesToProvision || PROVISION_SERVICES;
  dispatch({
    type: FULFILLED_ACTION(middlewareTypes.GET_PROVISIONING_USER),
    payload: { provisioningUser: user.username }
  });
  const userNamespace = getUsersSharedNamespaceName(user.username);
  const namespaceDisplayName = getUsersSharedNamespaceDisplayName(user.username);
  const namespaceObj = namespaceResource({ name: userNamespace });
  const namespaceRequestObj = namespaceRequestResource(namespaceDisplayName, { name: userNamespace });

  // Namespace
  findOrCreateOpenshiftResource(
    namespaceDef,
    namespaceObj,
    resObj => resObj.metadata.name === userNamespace,
    namespaceRequestDef,
    namespaceRequestObj
  )
    .then(() => {
      const siObjs = walkthroughServices.map(name =>
        buildServiceInstanceResourceObj({ namespace: userNamespace, name, user })
      );
      return Promise.all(
        siObjs.map(siObj =>
          // Service Instance
          findOrCreateOpenshiftResource(serviceInstanceDef(userNamespace), siObj, buildServiceInstanceCompareFn(siObj))
        )
      );
    })
    .then(() => {
      watch(serviceInstanceDef(userNamespace)).then(watchListener =>
        watchListener.onEvent(
          handleServiceInstanceWatchEvents.bind(null, dispatch, WATCH_SERVICES.concat(walkthroughServices))
        )
      );
      if (walkthroughServices.includes(DEFAULT_SERVICES.AMQ)) {
        watch(statefulSetDef(userNamespace)).then(watchListener =>
          watchListener.onEvent(handleAMQStatefulSetWatchEvents.bind(null, dispatch, userNamespace))
        );
      }
      watchAMQOnline(dispatch, user.username, { name: userNamespace });
    });
};

const getCustomConfig = (dispatch, user) => {
  const parsedUsername = cleanUsername(user.username);
  return fetch(`/customConfig?username=${parsedUsername}`)
    .then(res => res.json())
    .then(config => {
      if (config) {
        dispatch({
          type: FULFILLED_ACTION(middlewareTypes.GET_CUSTOM_CONFIG),
          payload: config
        });
      }
      return config;
    })
    .catch(err => {
      console.error(`Failed to retrieve custom config: ${err}`);
    });
};

/**
 * Handle an event that occured while watching the AMQ StatefulSet.
 * @param {string} namespace The namespace to perform actions on, based on events.
 * @param {Object} event The event to handle.
 */
const handleAMQStatefulSetWatchEvents = (dispatch, namespace, event) => {
  if (
    event.type === OpenShiftWatchEvents.OPENED ||
    event.type === OpenShiftWatchEvents.CLOSED ||
    event.type === OpenShiftWatchEvents.DELETED
  ) {
    return;
  }
  const sSet = event.payload;
  if (
    !sSet.spec ||
    !sSet.spec.template ||
    !sSet.spec.template.spec ||
    !sSet.spec.template.spec.containers ||
    !sSet.spec.template.spec.containers[0]
  ) {
    return;
  }
  const specContainer = sSet.spec.template.spec.containers[0];
  if (!specContainer.env) {
    return;
  }

  const usernameEnv = specContainer.env.find(e => e.name === 'AMQ_USER');
  const passwordEnv = specContainer.env.find(e => e.name === 'AMQ_PASSWORD');
  if (!usernameEnv.value || !passwordEnv.value) {
    return;
  }

  dispatch({
    type: FULFILLED_ACTION(middlewareTypes.GET_AMQ_CREDENTIALS),
    payload: {
      username: usernameEnv.value,
      password: passwordEnv.value,
      tcpUrl: `broker-amq-headless.${namespace}.svc`,
      url: `broker-amq-headless.${namespace}.svc`
    }
  });
};

/**
 * Handle an event that occured while watching ServiceInstances.
 * @param {Object} dispatch Redux dispatcher.
 * @param {Object} event The event to handle.
 */
const handleServiceInstanceWatchEvents = (dispatch, toWatch, event) => {
  if (event.type === OpenShiftWatchEvents.OPENED || event.type === OpenShiftWatchEvents.CLOSED) {
    return;
  }

  if (!toWatch.includes(event.payload.spec.clusterServiceClassExternalName)) {
    return;
  }
  if (event.type === OpenShiftWatchEvents.ADDED || event.type === OpenShiftWatchEvents.MODIFIED) {
    dispatch({
      type: FULFILLED_ACTION(middlewareTypes.CREATE_WALKTHROUGH),
      payload: event.payload
    });
  }
  if (event.type === OpenShiftWatchEvents.DELETED) {
    dispatch({
      type: FULFILLED_ACTION(middlewareTypes.REMOVE_WALKTHROUGH),
      payload: event.payload
    });
  }
};

const buildServiceBindingDef = namespace => ({
  name: 'servicebindings',
  namespace,
  version: 'v1beta1',
  group: 'servicecatalog.k8s.io'
});

/**
 * Handle an event for an Enmasse ServiceInstance.
 * Creates a service binding once Enmasse is provisioned
 * @param {Object} event The event to handle.
 */
const handleEnmasseServiceInstanceWatchEvents = (dispatch, event) => {
  const siObj = event.payload;
  if (event.payload.spec.clusterServiceClassExternalName !== DEFAULT_SERVICES.ENMASSE) {
    return;
  }
  if (siObj.status.provisionStatus === 'Provisioned') {
    dispatch({
      type: FULFILLED_ACTION(middlewareTypes.CREATE_WALKTHROUGH),
      payload: event.payload
    });

    const enmasseBindParams = {
      consoleAccess: true,
      consoleAdmin: true,
      externalAccess: true,
      receiveAddresses: '*',
      sendAddresses: '*'
    };

    const enmasseBindObj = {
      kind: 'ServiceBinding',
      metadata: {
        name: `${siObj.metadata.name}-bind`,
        namespace: siObj.metadata.namespace
      },
      spec: {
        instanceRef: {
          name: siObj.metadata.name
        },
        secretName: `${siObj.metadata.name}-credentials`,
        parameters: enmasseBindParams
      }
    };

    findOrCreateOpenshiftResource(
      buildServiceBindingDef(siObj.metadata.namespace),
      enmasseBindObj,
      resObj => resObj.metadata.name === enmasseBindObj.metadata.name
    );
  }
};

export {
  PROVISION_SERVICES,
  WATCH_SERVICES,
  DISPLAY_SERVICES,
  manageMiddlewareServices,
  mockMiddlewareServices,
  getCustomConfig,
  handleEnmasseServiceInstanceWatchEvents,
  getProductDetails,
  getProductDetailsForServiceClass
};
