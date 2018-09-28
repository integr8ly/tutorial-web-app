import { list, create, watch, update, currentUser, OpenShiftWatchEvents } from './openshiftServices';
import { middlewareTypes } from '../redux/constants';
import { FULFILLED_ACTION } from '../redux/helpers';
import { buildServiceInstanceResourceObj, DEFAULT_SERVICES } from '../common/serviceInstanceHelpers';
import {
  buildValidProjectNamespaceName,
  namespaceRequestDef,
  namespaceDef,
  namespaceRequestResource,
  statefulSetDef,
  routeDef,
  secretDef
} from '../common/openshiftHelpers';

const WALKTHROUGH_SERVICES = [
  DEFAULT_SERVICES.ENMASSE,
  DEFAULT_SERVICES.CHE,
  DEFAULT_SERVICES.FUSE,
  DEFAULT_SERVICES.AMQ,
  DEFAULT_SERVICES.LAUNCHER
];

/**
 * Dispatch a mock set of user services.
 * @param {Object} dispatch Redux dispatch.
 * @param {Object} mockData The mock data to dispatch.
 */
const mockMiddlewareServices = (dispatch, mockData) => {
  if (!mockData || !mockData.serviceInstances) {
    return;
  }
  mockData.serviceInstances.forEach(si =>
    dispatch({
      type: FULFILLED_ACTION(middlewareTypes.CREATE_WALKTHROUGH),
      payload: si
    })
  );
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
const manageMiddlewareServices = dispatch => {
  currentUser().then(user => {
    const userNamespace = buildValidProjectNamespaceName(user.username, 'walkthrough-projects');
    const namespaceObj = namespaceRequestResource(userNamespace);

    findOpenshiftResource(namespaceDef, namespaceObj)
      .then(foundResource => {
        if (!foundResource) {
          return create(namespaceRequestDef, namespaceObj);
        }
        return foundResource;
      })
      .then(() => {
        const siObjs = WALKTHROUGH_SERVICES.map(name =>
          buildServiceInstanceResourceObj({ namespace: userNamespace, name, user })
        );
        return Promise.all(
          siObjs.map(siObj =>
            findOrCreateOpenshiftResource(
              buildServiceInstanceDef(userNamespace),
              siObj,
              resObj => resObj.spec.clusterServiceClassExternalName === siObj.spec.clusterServiceClassExternalName
            )
          )
        );
      })
      .then(() => {
        watch(buildServiceInstanceDef(userNamespace)).then(watchListener =>
          watchListener.onEvent(handleServiceInstanceWatchEvents.bind(null, dispatch))
        );
        watch(statefulSetDef(userNamespace)).then(watchListener =>
          watchListener.onEvent(handleAMQStatefulSetWatchEvents.bind(null, dispatch, userNamespace))
        );
        watch(secretDef(userNamespace)).then(watchListener =>
          watchListener.onEvent(handleEnmasseCredentialsWatchEvents.bind(null, dispatch, userNamespace))
        );
      });
  });
};

/**
 * Construct an OpenShift Resource Definition for a ServiceInstance.
 * @param {string} namespace The namespace to reference in the definition.
 */
const buildServiceInstanceDef = namespace => ({
  name: 'serviceinstances',
  namespace,
  version: 'v1beta1',
  group: 'servicecatalog.k8s.io'
});

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
    payload: { username: usernameEnv.value, password: passwordEnv.value, url: `broker-amq-amqp.${namespace}.svc` }
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
  if (secret.metadata.name.includes('enmasse-standard') && secret.metadata.name.includes('credentials')) {
    const amqpHost = window.atob(secret.data.messagingHost);
    const amqpPort = window.atob(secret.data.messagingAmqpPort);
    const username = window.atob(secret.data.username);
    const password = window.atob(secret.data.password);
    const amqpURL = `amqp://${amqpHost}:${amqpPort}?amqp.saslMechanisms=PLAIN`;

    dispatch({
      type: FULFILLED_ACTION(middlewareTypes.GET_ENMASSE_CREDENTIALS),
      payload: { url: amqpURL, username, password }
    });
  }
};

/**
 * Handle an event that occured while watching ServiceInstances.
 * @param {Object} dispatch Redux dispatcher.
 * @param {Object} event The event to handle.
 */
const handleServiceInstanceWatchEvents = (dispatch, event) => {
  if (event.type === OpenShiftWatchEvents.OPENED || event.type === OpenShiftWatchEvents.CLOSED) {
    return;
  }

  if (!WALKTHROUGH_SERVICES.includes(event.payload.spec.clusterServiceClassExternalName)) {
    return;
  }
  if (event.type === OpenShiftWatchEvents.ADDED || event.type === OpenShiftWatchEvents.MODIFIED) {
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
      name: 'console'
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
    update(buildServiceInstanceDef(event.payload.metadata.namespace), event.payload);
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

/**
 * Helper function for finding a single OpenShift Resource.
 * @param {Object} openshiftResourceDef The definition of the OpenShift Resource.
 * @param {Object} resToFind The OpenShift Resource itself. By default this needs only to contain a name.
 * @param {Function} compareFn A custom function for comparing resources, determines if a resource is found.
 */
const findOpenshiftResource = (
  openshiftResourceDef,
  resToFind,
  compareFn = resObj => resObj.metadata.name === resToFind.metadata.name
) =>
  list(openshiftResourceDef)
    .then(listResponse => (listResponse && listResponse.items ? listResponse.items : []))
    .then(resourceObjs => resourceObjs.find(resObj => compareFn(resObj)));

/**
 * Helper function for creating an OpenShift Resource if it doesn't exist already.
 * @param {Object} openshiftResourceDef The definition of the OpenShift Resource.
 * @param {Object} resToFind The OpenShift Resource itself. By default this needs only to contain a name.
 * @param {Function} compareFn A custom function for comparing resources, determines if a resource is found.
 */
const findOrCreateOpenshiftResource = (openshiftResourceDef, resToFind, compareFn) =>
  findOpenshiftResource(openshiftResourceDef, resToFind, compareFn).then(foundResource => {
    if (!foundResource) {
      return create(openshiftResourceDef, resToFind);
    }
    return Promise.resolve(foundResource);
  });

export { manageMiddlewareServices, mockMiddlewareServices };
