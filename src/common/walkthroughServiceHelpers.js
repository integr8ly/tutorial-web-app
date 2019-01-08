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

module.exports = {
  getWalkthroughServiceInfo
};
