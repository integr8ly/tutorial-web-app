import { create, list } from '../services/openshiftServices';

/**
 * Construct a projects namespace from a given username.
 * Note that the namespace name might contain the full username as it is sanitized first.
 * @param {string} username The username to create the namespace name from.
 * @param {string} suffix A suffix to append to the end of the users namespace.
 */
const buildValidProjectNamespaceName = (username, suffix) => `${cleanUsername(username)}-${suffix}`;

/**
 * Get a sanitized version of a username, so it can be used to name OpenShift.
 * @param {string} username The username to sanitize.
 */
const cleanUsername = username => username.replace(/@/g, '-').replace(/\./g, '-');

/**
 * Helper function for finding a single OpenShift Resource.
 * @param {Object} resourceDef The definition of the OpenShift Resource.
 * @param {Object} resToFind The OpenShift Resource itself. By default this needs only to contain a name.
 * @param {Function} compareFn A custom function for comparing resources, determines if a resource is found.
 */
const findOpenshiftResource = (
  resourceDef,
  resource,
  compareFn = resObj => resObj.metadata.name === resource.metadata.name
) =>
  list(resourceDef)
    .then(listResponse => (listResponse && listResponse.items ? listResponse.items : []))
    .then(resourceObjs => resourceObjs.find(resObj => compareFn(resObj)));

/**
 * Helper function for creating an OpenShift Resource if it doesn't exist already.
 * @param {Object} resourceDef The definition of the OpenShift Resource.
 * @param {Object} resToFind The OpenShift Resource itself. By default this needs only to contain a name.
 * @param {Function} compareFn A custom function for comparing resources, determines if a resource is found.
 */
const findOrCreateOpenshiftResource = (resourceDef, resource, compareFn) =>
  findOpenshiftResource(resourceDef, resource, compareFn).then(foundResource => {
    if (!foundResource) {
      return create(resourceDef, resource);
    }
    return Promise.resolve(foundResource);
  });

const namespaceRequestDef = {
  name: 'projectrequests',
  version: 'v1',
  group: 'project.openshift.io'
}
const namespaceRequestResource = name => ({
  kind: 'ProjectRequest',
  metadata: {
    name
  }
});
const namespaceDef = {
  name: 'projects',
  version: 'v1',
  group: 'project.openshift.io'
}
const namespaceResource = name => ({
  kind: 'projects',
  metadata: {
    name
  }
});
const statefulSetDef = namespace => ({
  name: 'statefulsets',
  group: 'apps',
  version: 'v1beta1',
  namespace
});
const routeDef = namespace => ({
  name: 'routes',
  group: 'route.openshift.io',
  version: 'v1',
  namespace
});
const serviceInstanceDef = namespace => ({
  name: 'serviceinstances',
  namespace,
  version: 'v1beta1',
  group: 'servicecatalog.k8s.io'
});

export { buildValidProjectNamespaceName, cleanUsername, findOrCreateOpenshiftResource, findOpenshiftResource, namespaceRequestDef, namespaceRequestResource, namespaceDef, serviceInstanceDef, namespaceResource, statefulSetDef, routeDef };
