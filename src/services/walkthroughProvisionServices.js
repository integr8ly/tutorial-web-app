import {
  buildValidProjectNamespaceName,
  findOpenshiftResource,
  findOrCreateOpenshiftResource,
  namespaceRequestDef,
  namespaceRequestResource,
  namespaceDef,
  namespaceResource,
  serviceInstanceDef,
  routeDef
} from '../common/openshiftHelpers';
import { currentUser, create, watch, OpenShiftWatchEvents } from './openshiftServices';
import {
  DEFAULT_SERVICES,
  buildServiceInstanceResourceObj,
  buildServiceInstanceCompareFn
} from '../common/serviceInstanceHelpers';
import { FULFILLED_ACTION } from '../redux/helpers';
import { GET_WALKTHROUGH_SERVICE } from '../redux/constants/walkthroughServicesConstants';

/**
 * Provisions the services required for Walkthrough 1 into a username prefixed namespace.
 * @param {Object} amqCredentials The credentials from the AMQ instance, including URL.
 */
const provisionWalkthroughOne = (dispatch, amqCredentials) =>
  currentUser().then(user => {
    const namespace = buildValidProjectNamespaceName(user.username, 'walkthrough-one');
    const siDef = serviceInstanceDef(namespace);
    return findOpenshiftResource(namespaceDef, namespaceResource(namespace))
      .then(foundResource => {
        if (!foundResource) {
          return create(namespaceRequestDef, namespaceRequestResource(namespace));
        }
        return foundResource;
      })
      .then(() => {
        const messagingAppSiInfo = {
          namespace,
          name: DEFAULT_SERVICES.MESSAGING_APP,
          user,
          amqCredentials
        };
        const messagingSiResource = buildServiceInstanceResourceObj(messagingAppSiInfo);
        return findOrCreateOpenshiftResource(
          siDef,
          messagingSiResource,
          buildServiceInstanceCompareFn(messagingSiResource)
        );
      })
      .then(() => {
        const crudAppSiInfo = {
          namespace,
          name: DEFAULT_SERVICES.CRUD_APP
        };
        const crudSiResource = buildServiceInstanceResourceObj(crudAppSiInfo);
        return findOrCreateOpenshiftResource(siDef, crudSiResource, buildServiceInstanceCompareFn(crudSiResource));
      })
      .then(() => {
        watch(routeDef(namespace)).then(watchListener => watchListener.onEvent(handleWalkthoughOneRoutes.bind(null, dispatch)));
      });
  });

const handleWalkthoughOneRoutes = (dispatch, event) => {
  if (
    event.type === OpenShiftWatchEvents.OPENED ||
    event.type === OpenShiftWatchEvents.CLOSED ||
    event.type === OpenShiftWatchEvents.DELETED
  ) {
    return;
  }

  const route = event.payload;
  if (route && route.spec && route.spec.to && (route.spec.to.name === DEFAULT_SERVICES.CRUD_APP || route.spec.to.name === DEFAULT_SERVICES.MESSAGING_APP)) {
    dispatch({
      type: FULFILLED_ACTION(GET_WALKTHROUGH_SERVICE),
      payload: route
    })
  }
}

export { provisionWalkthroughOne };
