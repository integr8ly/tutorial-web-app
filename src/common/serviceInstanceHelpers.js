/* eslint class-methods-use-this: ["error", { "exceptMethods": ["isTransformable", "transform"] }] */
import get from 'lodash.get';
import { REJECTED_ACTION } from '../redux/helpers';
import { GET_THREAD } from '../redux/constants/threadConstants';
import { SERVICE_TYPES } from '../redux/constants/middlewareConstants';

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
      name: siInfo.username,
      namespace: siInfo.namespace
    };
    defaultTransform.spec.clusterServicePlanExternalName = 'standard-unlimited';
    return defaultTransform;
  }
}

const DEFAULT_SERVICES = {
  ENMASSE: 'amq-online-standard',
  FUSE: 'fuse',
  CHE: 'codeready',
  LAUNCHER: 'launcher',
  THREESCALE: '3scale',
  APICURIO: 'apicurio',
  FUSE_MANAGED: 'fuse-managed',
  RHSSO: 'rhsso'
};

const DEFAULT_TRANSFORMS = [
  new EnMasseServiceInstanceTransform(),
  new AMQServiceInstanceTransform(),
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
const getDashboardUrl = svc => {
  // Allow for non-Service Instance services
  if (svc.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
    return svc.url;
  }

  const { status, metadata } = svc;
  if (status.dashboardURL) {
    return status.dashboardURL;
  } else if (metadata.annotations && metadata.annotations['integreatly/dashboard-url']) {
    return metadata.annotations['integreatly/dashboard-url'];
  }
  return '';
};

const findService = (svcName, svcList) => {
  if (!svcName || !svcList) {
    return null;
  }
  return svcList.find(svc => {
    if (svc.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
      return svc;
    }
    return get(svc, 'spec.clusterServiceClassExternalName') === svcName;
  });
};

const findServices = (svcNames, svcList) => {
  if (!svcNames || !svcList) {
    return [];
  }
  return svcNames.map(svcName => findService(svcName, svcList)).filter(svc => !!svc);
};

export {
  buildServiceInstanceCompareFn,
  buildServiceInstanceResourceObj,
  DEFAULT_SERVICES,
  DefaultServiceInstanceTransform,
  EnMasseServiceInstanceTransform,
  handleServiceInstancesProvision,
  getDashboardUrl,
  findService,
  findServices
};
