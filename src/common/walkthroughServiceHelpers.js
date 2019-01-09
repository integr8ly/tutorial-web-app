/**
 * Retrieves information from a ServiceInstance object that can be used in the
 * context of it as a walkthrough service. For example, the GA status of the
 * service and a name suitable to be shown in a UI instead of the identifier.
 *
 * @param {object} svcInstance A ServiceInstance resource.
 * @returns {object}
 */
const getWalkthroughServiceInfo = svcInstance => {
  const { productDetails, spec } = svcInstance;

  if (productDetails) {
    return productDetails;
  }
  return {
    prettyName: spec.clusterServiceClassExternalName
  };
};

const isServiceProvisioned = svcInstance => {
  const readyCondition = getReadyCondition(svcInstance);
  if (!readyCondition) {
    return false;
  }
  return readyCondition.status === 'True';
};

const isServiceProvisioning = svcInstance => {
  const readyCondition = getReadyCondition(svcInstance);
  if (!readyCondition) {
    return false;
  }
  return (
    readyCondition.status === 'False' &&
    (readyCondition.reason === 'Provisioning' || readyCondition.reason === 'ProvisionRequestInFlight')
  );
};

const isServiceProvisionFailed = svcInstance => {
  const readyCondition = getReadyCondition(svcInstance);
  if (!readyCondition) {
    return false;
  }
  return (
    readyCondition.status === 'False' &&
    readyCondition.reason !== 'Provisioning' &&
    readyCondition.reason !== 'ProvisionRequestInFlight'
  );
};

const getServiceProvisionMessage = svcInstance => {
  const readyCondition = getReadyCondition(svcInstance);
  if (!readyCondition) {
    return '';
  }
  return readyCondition.message;
};

const getReadyCondition = svcInstance => {
  const {
    status: { conditions = [] }
  } = svcInstance;
  return conditions.find(c => c.type === 'Ready');
};

module.exports = {
  getWalkthroughServiceInfo,
  isServiceProvisioned,
  isServiceProvisioning,
  isServiceProvisionFailed,
  getServiceProvisionMessage
};
