import { list, create, watch, update, currentUser, OpenShiftWatchEvents } from './openshiftServices';
import { middlewareTypes } from '../redux/constants';
import { FULFILLED_ACTION } from '../redux/helpers';
import { buildServiceInstanceResourceObj, DEFAULT_SERVICES } from '../common/serviceInstanceHelpers';

const WALKTHROUGH_SERVICES = Object.values(DEFAULT_SERVICES);

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
    const userNamespace = buildValidProjectNamespaceName(user.username);

    const namespaceRequestResourceDef = {
      name: 'projectrequests',
      version: 'v1',
      group: 'project.openshift.io'
    };
    const namespaceResourceDef = {
      name: 'projects',
      version: 'v1',
      group: 'project.openshift.io'
    };
    const namespaceObj = {
      kind: 'ProjectRequest',
      metadata: {
        name: userNamespace
      }
    };
    const statefulSetDef = {
      name: 'statefulsets',
      group: 'apps',
      version: 'v1beta1',
      namespace: userNamespace
    };

    findOpenshiftResource(namespaceResourceDef, namespaceObj)
      .then(foundResource => {
        if (!foundResource) {
          return create(namespaceRequestResourceDef, namespaceObj);
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
        watch(statefulSetDef).then(watchListener =>
          watchListener.onEvent(handleAMQStatefulSetWatchEvents.bind(null, dispatch, userNamespace))
        );
      });
  });
};

/**
 * Construct an OpenShift Resource Definition for a Route.
 * @param {string} namespace The namespace to reference in the definition.
 */
const buildRouteDef = namespace => ({
  name: 'routes',
  group: 'route.openshift.io',
  version: 'v1',
  namespace
});

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
    payload: { username: usernameEnv.value, password: passwordEnv.value }
  });
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
  findOpenshiftResource(buildRouteDef(event.payload.metadata.namespace), routeResource).then(route => {
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

/**
 * Construct a projects namespace from a given username.
 * Note that the namespace name might contain the full username as it is sanitized first.
 * @param {string} username The username to create the namespace name from.
 */
const buildValidProjectNamespaceName = username => `${cleanUsername(username)}-walkthrough-projects`;

/**
 * Get a sanitized version of a username, so it can be used to name OpenShift.
 * @param {string} username The username to sanitize.
 */
const cleanUsername = username => username.replace(/@/g, '-').replace(/\./g, '-');

export { manageMiddlewareServices, mockMiddlewareServices };
