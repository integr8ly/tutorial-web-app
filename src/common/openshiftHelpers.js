import shajs from 'sha.js';
import { create, list } from '../services/openshiftServices';

// The total length of a namespace name.
const NAMESPACE_NAME_LENGTH = 20;
// The length of the username part of a namespace.
const NAMESPACE_USERNAME_LENGTH = 10;
// The length of the hash appended to the end of the namespace.
const NAMESPACE_HASH_LENGTH = 4;

/**
 * Construct a projects namespace from a given username.
 * Note that the namespace name might contain the full username as it is sanitized first.
 * The namespace will be limited to 40 characters max so as to allow reasonable length route
 * names to be created i.e. not hit a 65 character limit.
 * @param {string} username The username to create the namespace name from.
 * @param {string} suffix A suffix to append to the end of the users namespace.
 */
const buildValidProjectNamespaceName = (username, suffix) => {
  const safeUsername = cleanUsername(username);

  const shortHash = trimmedHash(`${safeUsername}-${suffix}`, NAMESPACE_HASH_LENGTH);
  const trimmedUsername = safeUsername.substring(0, NAMESPACE_USERNAME_LENGTH);
  // The 2 accounts for the hyphens used.
  const namespaceSuffixLength = NAMESPACE_NAME_LENGTH - trimmedUsername.length - NAMESPACE_HASH_LENGTH - 2;
  const trimmedSuffix = suffix.substring(0, namespaceSuffixLength);
  const namespaceName = `${trimmedUsername}-${trimmedSuffix}-${shortHash}`.toLowerCase();
  // Remove subsequent dashes before returning to avoid substitution for "em dash" by asciidoctor [INTLY-424]
  return namespaceName.replace(/-{2,}/g, '-');
};

const buildValidNamespaceDisplayName = (username, suffix) => `${username} - ${suffix}`;

/**
 * Get a sanitized version of a username, so it can be used to name OpenShift.
 * @param {string} username The username to sanitize.
 */
const cleanUsername = username =>
  username
    .replace(/@/g, '-')
    .replace(/\./g, '-')
    .replace(/\s/g, '-');

const trimmedHash = (namespace, length) =>
  shajs('sha256')
    .update(namespace)
    .digest('hex')
    .slice(-length);

const buildNamespacedServiceInstanceName = (prefix, si) => `${prefix}-${si.spec.to.name}`;

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
 * @param {Object} resToCreateDef The definition of the OpenShift Resource to create. e.g find kind: Project, but create kind: ProjectRequest
 * @param {Object} resToCreateObj The OpenShift Resource to create
 */
const findOrCreateOpenshiftResource = (
  resourceDef,
  resourceToFind,
  compareFn,
  resourceToCreateDef,
  resourceToCreateObj
) =>
  findOpenshiftResource(resourceDef, resourceToFind, compareFn).then(foundResource => {
    if (!foundResource) {
      if (resourceToCreateDef && resourceToCreateObj) {
        return create(resourceToCreateDef, resourceToCreateObj);
      }
      create(resourceDef, resourceToFind);
    }
    return Promise.resolve(foundResource);
  });

export {
  buildValidProjectNamespaceName,
  findOrCreateOpenshiftResource,
  findOpenshiftResource,
  buildNamespacedServiceInstanceName,
  cleanUsername,
  buildValidNamespaceDisplayName
};
