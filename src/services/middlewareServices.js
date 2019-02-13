import { watch, update, OpenShiftWatchEvents } from './openshiftServices';
import { middlewareTypes } from '../redux/constants';
import { FULFILLED_ACTION } from '../redux/helpers';
import {
  buildServiceInstanceCompareFn,
  buildServiceInstanceResourceObj,
  DEFAULT_SERVICES
} from '../common/serviceInstanceHelpers';
import {
  buildValidProjectNamespaceName,
  buildValidNamespaceDisplayName,
  cleanUsername,
  findOpenshiftResource,
  findOrCreateOpenshiftResource
} from '../common/openshiftHelpers';
import {
  namespaceResource,
  namespaceRequestResource,
  namespaceDef,
  namespaceRequestDef,
  serviceInstanceDef,
  statefulSetDef,
  secretDef,
  routeDef
} from '../common/openshiftResourceDefinitions';

import productDetails from '../product-info';

const WALKTHROUGH_SERVICES = [
  DEFAULT_SERVICES.ENMASSE,
  DEFAULT_SERVICES.CHE,
  DEFAULT_SERVICES.FUSE,
  DEFAULT_SERVICES.LAUNCHER,
  DEFAULT_SERVICES.THREESCALE,
  DEFAULT_SERVICES.APICURIO
];

/**
 * Lookup product details (name and GA status) and add them to the
 * service instance object
 * @param serviceInstance Service instance retrieved from Openshift
 */
const setProductDetails = serviceInstance => {
  const { spec } = serviceInstance;
  if (spec) {
    serviceInstance.productDetails = productDetails[spec.clusterServiceClassExternalName];
  }
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
    setProductDetails(si);
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
  const walkthroughServices = config.servicesToProvision || WALKTHROUGH_SERVICES;
  dispatch({
    type: FULFILLED_ACTION(middlewareTypes.GET_PROVISIONING_USER),
    payload: { provisioningUser: user.username }
  });
  const userNamespace = buildValidProjectNamespaceName(user.username, 'shared');
  const namespaceDisplayName = buildValidNamespaceDisplayName(user.username, 'Shared Services');
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
        watchListener.onEvent(handleServiceInstanceWatchEvents.bind(null, dispatch, walkthroughServices))
      );
      if (walkthroughServices.includes(DEFAULT_SERVICES.AMQ)) {
        watch(statefulSetDef(userNamespace)).then(watchListener =>
          watchListener.onEvent(handleAMQStatefulSetWatchEvents.bind(null, dispatch, userNamespace))
        );
      }
      if (walkthroughServices.includes(DEFAULT_SERVICES.ENMASSE)) {
        watch(secretDef(userNamespace)).then(watchListener =>
          watchListener.onEvent(handleEnmasseCredentialsWatchEvents.bind(null, dispatch, userNamespace))
        );
      }
    });
};

const getCustomConfig = (dispatch, user) => {
  const parsedUsername = cleanUsername(user.username);
  return fetch(`/customConfig?username=${parsedUsername}`)
    .then(res => res.json())
    .then(config => {
      if (config && config.services) {
        dispatch({
          type: FULFILLED_ACTION(middlewareTypes.GET_CUSTOM_SERVICES),
          payload: {
            services: config.services
          }
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
 * Handle an event that occurred while watching the Enmasse Secrets
 * @param {Object} dispatch Redux dispatcher.
 * @param {string} namespace The namespace to perform actions on, based on events.
 * @param {Object} event The event to handle.
 */
const handleEnmasseCredentialsWatchEvents = (dispatch, namespace, event) => {
  if (
    event.type === OpenShiftWatchEvents.OPENED ||
    event.type === OpenShiftWatchEvents.CLOSED ||
    event.type === OpenShiftWatchEvents.DELETED
  ) {
    return;
  }

  const secret = event.payload;
  if (secret.metadata.name.includes('amq-online-standard') && secret.metadata.name.includes('credentials')) {
    const amqpHost = window.atob(secret.data.messagingHost);
    const username = window.atob(secret.data.username);
    const password = window.atob(secret.data.password);

    dispatch({
      type: FULFILLED_ACTION(middlewareTypes.GET_ENMASSE_CREDENTIALS),
      payload: { url: amqpHost, username, password }
    });
  }
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
    setProductDetails(event.payload);
    dispatch({
      type: FULFILLED_ACTION(middlewareTypes.CREATE_WALKTHROUGH),
      payload: event.payload
    });

    // We know that the AMQ ServiceInstance will not have a dashboardURL associated with it.
    // The reason for this is that the Template Service Broker doesn't allow for dashboardURLs.
    // Because of this, for AMQ, we need to set an annotation on the ServiceInstance with
    // the route specified there instead.
    if (
      event.payload.kind === 'ServiceInstance' &&
      event.payload.spec.clusterServiceClassExternalName === DEFAULT_SERVICES.AMQ
    ) {
      handleAMQServiceInstanceWatchEvents(event);
    }

    if (
      event.payload.kind === 'ServiceInstance' &&
      event.payload.spec.clusterServiceClassExternalName === DEFAULT_SERVICES.ENMASSE
    ) {
      handleEnmasseServiceInstanceWatchEvents(event);
    }
  }
  if (event.type === OpenShiftWatchEvents.DELETED) {
    dispatch({
      type: FULFILLED_ACTION(middlewareTypes.REMOVE_WALKTHROUGH),
      payload: event.payload
    });
  }
};

/**
 * Handle an event for an AMQ ServiceInstance.
 * Creates a required annotation on the ServiceInstance for routing.
 * @param {Object} event The event to handle.
 */
const handleAMQServiceInstanceWatchEvents = event => {
  const dashboardUrl = 'integreatly/dashboard-url';
  if (event.payload.metadata.annotations && event.payload.metadata.annotations[dashboardUrl]) {
    return;
  }
  const routeResource = {
    metadata: {
      name: 'console-jolokia'
    }
  };
  findOpenshiftResource(routeDef(event.payload.metadata.namespace), routeResource).then(route => {
    if (!route) {
      return;
    }
    if (!event.payload.metadata.annotations) {
      event.payload.metadata.annotations = {};
    }
    event.payload.metadata.annotations[dashboardUrl] = `http://${route.spec.host}`;
    update(serviceInstanceDef(event.payload.metadata.namespace), event.payload);
  });
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
const handleEnmasseServiceInstanceWatchEvents = event => {
  const siObj = event.payload;
  if (siObj.status.provisionStatus === 'Provisioned') {
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

export { manageMiddlewareServices, mockMiddlewareServices, getCustomConfig };
