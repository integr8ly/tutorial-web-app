/* eslint class-methods-use-this: ["error", { "exceptMethods": ["isTransformable", "transform"] }] */
import { OpenShiftWatchEvents } from '../services/openshiftServices';
import { GET_WALKTHROUGH_SERVICE } from '../redux/constants/walkthroughConstants';
import { FULFILLED_ACTION, REJECTED_ACTION } from '../redux/helpers';
import { GET_THREAD } from '../redux/constants/threadConstants';

class DefaultServiceInstanceTransform {
  isTransformable() {
    return true;
  }

  transform(siInfo) {
    return {
      kind: 'ServiceInstance',
      metadata: {
        generateName: `${siInfo.name}-`,
        namespace: siInfo.namespace
      },
      spec: {
        clusterServiceClassExternalName: siInfo.name,
        clusterServicePlanExternalName: `default-${siInfo.name}`
      }
    };
  }
}

class AMQServiceInstanceTransform {
  isTransformable(siInfo) {
    return siInfo.name === DEFAULT_SERVICES.AMQ;
  }

  transform(siInfo) {
    const defaultTransform = new DefaultServiceInstanceTransform().transform(siInfo);
    defaultTransform.spec.clusterServicePlanExternalName = 'default';
    return defaultTransform;
  }
}

class EnMasseServiceInstanceTransform {
  isTransformable(siInfo) {
    return siInfo.name === DEFAULT_SERVICES.ENMASSE;
  }

  transform(siInfo) {
    const defaultTransform = new DefaultServiceInstanceTransform().transform(siInfo);
    defaultTransform.spec.parameters = {
      name: siInfo.username
    };
    defaultTransform.spec.clusterServicePlanExternalName = 'standard-unlimited';
    return defaultTransform;
  }
}

class CRUDAppInstanceTransform {
  isTransformable(siInfo) {
    return siInfo.name === DEFAULT_SERVICES.CRUD_APP;
  }

  transform(siInfo) {
    const defaultTransform = new DefaultServiceInstanceTransform().transform(siInfo);
    defaultTransform.spec.clusterServicePlanExternalName = 'default';
    return defaultTransform;
  }
}

class MessagingAppServiceInstanceTransform {
  isTransformable(siInfo) {
    return siInfo.name === DEFAULT_SERVICES.MESSAGING_APP;
  }

  transform(siInfo) {
    const defaultTransform = new DefaultServiceInstanceTransform().transform(siInfo);
    defaultTransform.spec.clusterServicePlanExternalName = 'default';

    defaultTransform.spec.parameters = {
      MESSAGING_SERVICE_PASSWORD: siInfo.otherData.password,
      MESSAGING_SERVICE_USER: siInfo.otherData.username,
      MESSAGING_SERVICE_HOST: siInfo.otherData.url
    };

    return defaultTransform;
  }
}

const DEFAULT_SERVICES = {
  ENMASSE: 'amq-online-standard',
  AMQ: 'amq-broker-71-persistence',
  FUSE: 'fuse',
  CHE: 'che',
  LAUNCHER: 'launcher',
  THREESCALE: '3scale',
  CRUD_APP: 'spring-boot-rest-http-crud',
  MESSAGING_APP: 'nodejs-messaging-work-queue-frontend',
  FUSE_AGGREGATOR: 'fuse-flights-aggregator'
};

const DEFAULT_TRANSFORMS = [
  new EnMasseServiceInstanceTransform(),
  new AMQServiceInstanceTransform(),
  new CRUDAppInstanceTransform(),
  new MessagingAppServiceInstanceTransform(),
  new DefaultServiceInstanceTransform()
];

/**
 * Construct a ServiceInstance OpenShift resource from a small amount of generic
 * ServiceInstance information.
 *
 * The reasoning for separating this out is that many ServiceInstances require
 * default parameters to be setup or a plan other than default to be set. This
 * will handle those circumstances.
 * @param {Object} siInfo Default siInfo.
 * @param {Object[]} transforms An array of Classes used to transform the default siInfo.
 */
const buildServiceInstanceResourceObj = (siInfo, transforms = DEFAULT_TRANSFORMS) => {
  const transform = transforms.find(t => t.isTransformable(siInfo));
  if (!transform) {
    return null;
  }
  return transform.transform(siInfo);
};

const buildServiceInstanceCompareFn = si => res =>
  res.spec.clusterServiceClassExternalName === si.spec.clusterServiceClassExternalName;

const handleWalkthroughOneRoutes = (namespacePrefix, dispatch, event) => {
  if (
    event.type === OpenShiftWatchEvents.OPENED ||
    event.type === OpenShiftWatchEvents.CLOSED ||
    event.type === OpenShiftWatchEvents.DELETED
  ) {
    return;
  }

  const route = event.payload;
  if (
    route &&
    route.spec &&
    route.spec.to &&
    (route.spec.to.name === DEFAULT_SERVICES.CRUD_APP || route.spec.to.name === DEFAULT_SERVICES.MESSAGING_APP)
  ) {
    dispatch({
      type: FULFILLED_ACTION(GET_WALKTHROUGH_SERVICE),
      payload: {
        prefix: namespacePrefix,
        data: route
      }
    });
  }
};

const handleServiceInstancesProvision = (namespacePrefix, dispatch, event) => {
  const serviceInstance = event.payload;

  if (serviceInstance && serviceInstance.status && serviceInstance.status.conditions) {
    const lastCondition = serviceInstance.status.conditions.pop();
    if (!lastCondition || lastCondition.type !== 'Failed') {
      return;
    }
    dispatch({
      type: REJECTED_ACTION(GET_THREAD),
      error: true,
      payload: {
        errorMessage: lastCondition.message
      }
    });
  }
};
/**
 * Try to get the service's dashboard URL preferably from the status properties and
 * as a fallback the integreatly/dashboard-url annotation. Returns an empty string
 * if neither is applicable.
 * @param si Service Instance Object
 * @returns {string} Dashboard URL
 */
const getDashboardUrl = si => {
  const { status, metadata } = si;
  if (status.dashboardURL) {
    return status.dashboardURL;
  } else if (metadata.annotations && metadata.annotations['integreatly/dashboard-url']) {
    return metadata.annotations['integreatly/dashboard-url'];
  }
  return '';
};

const handleWalkthroughTwoRoutes = (namespacePrefix, dispatch, event) => {
  if (
    event.type === OpenShiftWatchEvents.OPENED ||
    event.type === OpenShiftWatchEvents.CLOSED ||
    event.type === OpenShiftWatchEvents.DELETED
  ) {
    return;
  }

  const route = event.payload;
  if (route && route.spec && route.spec.to && route.spec.to.name === DEFAULT_SERVICES.FUSE_AGGREGATOR) {
    dispatch({
      type: FULFILLED_ACTION(GET_WALKTHROUGH_SERVICE),
      payload: {
        prefix: namespacePrefix,
        data: route
      }
    });
  }
};

export {
  buildServiceInstanceCompareFn,
  buildServiceInstanceResourceObj,
  CRUDAppInstanceTransform,
  DEFAULT_SERVICES,
  DefaultServiceInstanceTransform,
  EnMasseServiceInstanceTransform,
  handleWalkthroughOneRoutes,
  handleServiceInstancesProvision,
  MessagingAppServiceInstanceTransform,
  getDashboardUrl,
  handleWalkthroughTwoRoutes
};
