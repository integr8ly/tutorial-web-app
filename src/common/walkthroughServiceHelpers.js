import { SERVICE_TYPES, SERVICE_STATUSES } from '../redux/constants/middlewareConstants';

/**
 * Retrieves information from a ServiceInstance object that can be used in the
 * context of it as a walkthrough service. For example, the GA status of the
 * service and a name suitable to be shown in a UI instead of the identifier.
 *
 * @param {object} svc A ServiceInstance resource.
 * @returns {object}
 */
const getWalkthroughServiceInfo = svc => {
  const { productDetails, spec } = svc;

  if (productDetails) {
    return productDetails;
  }
  return {
    prettyName: spec.clusterServiceClassExternalName
  };
};

const isServiceProvisioned = svc => {
  if (svc.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
    return svc.status === SERVICE_STATUSES.PROVISIONED;
  }
  const readyCondition = getReadyCondition(svc);
  if (!readyCondition) {
    return false;
  }
  return readyCondition.status === 'True';
};

const isServiceProvisioning = svc => {
  if (svc.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
    return svc.status === SERVICE_STATUSES.PROVISIONING;
  }
  const readyCondition = getReadyCondition(svc);
  if (!readyCondition) {
    return false;
  }
  return (
    readyCondition.status === 'False' &&
    (readyCondition.reason === 'Provisioning' || readyCondition.reason === 'ProvisionRequestInFlight')
  );
};

const isServiceProvisionFailed = svc => {
  if (svc.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
    return svc.status === SERVICE_STATUSES.UNAVAILABLE;
  }
  const readyCondition = getReadyCondition(svc);
  if (!readyCondition) {
    return false;
  }
  return (
    readyCondition.status === 'False' &&
    readyCondition.reason !== 'Provisioning' &&
    readyCondition.reason !== 'ProvisionRequestInFlight'
  );
};

const getServiceProvisionMessage = svc => {
  const readyCondition = getReadyCondition(svc);
  if (!readyCondition) {
    return '';
  }
  return readyCondition.message;
};

const getReadyCondition = svc => {
  const {
    status: { conditions = [] }
  } = svc;
  return conditions.find(c => c.type === 'Ready');
};

export {
  getWalkthroughServiceInfo,
  isServiceProvisioned,
  isServiceProvisioning,
  isServiceProvisionFailed,
  getServiceProvisionMessage
};
