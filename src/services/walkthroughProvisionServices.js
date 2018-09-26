import { buildValidProjectNamespaceName, findOpenshiftResource, findOrCreateOpenshiftResource, namespaceRequestDef, namespaceRequestResource, namespaceDef, namespaceResource, serviceInstanceDef } from "../common/openshiftHelpers";
import { currentUser, create } from "./openshiftServices";
import { DEFAULT_SERVICES, buildServiceInstanceResourceObj } from "../common/serviceInstanceHelpers";

/**
 * Provisions the services required for Walkthrough 1 into a username prefixed namespace.
 * @param {Object} amqCredentials The credentials from the AMQ instance, including URL. 
 */
const provisionWalkthroughOne = amqCredentials => {
  return currentUser().then(user => {
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
        }
        const messagingSiResource = buildServiceInstanceResourceObj(messagingAppSiInfo);
        return findOrCreateOpenshiftResource(siDef, messagingSiResource, buildServiceInstanceCompareFn(messagingSiResource));
      })
      .then(() => {
        const crudAppSiInfo = {
          namespace,
          name: DEFAULT_SERVICES.CRUD_APP
        }
        const crudSiResource = buildServiceInstanceResourceObj(crudAppSiInfo);
        return findOrCreateOpenshiftResource(siDef, crudSiResource, buildServiceInstanceCompareFn(crudSiResource))
      });
  });
}

const buildServiceInstanceCompareFn = si => (res => res.spec.clusterServiceClassExternalName === si.spec.clusterServiceClassExternalName)

export { provisionWalkthroughOne }
