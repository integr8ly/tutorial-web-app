import { namespaceDef, namespaceRequestDef, namespaceRequestResource, serviceInstanceDef, namespaceResource } from "../common/openshiftResourceDefinitions";
import { buildServiceInstanceResourceObj, DEFAULT_SERVICES, buildServiceInstanceCompareFn } from "../common/serviceInstanceHelpers";
import { watch, OpenShiftWatchEvents } from './openshiftServices';
import { findOrCreateOpenshiftResource } from '../common/openshiftHelpers';

const provisionFuseOnline = (username, namespace) => {
  return new Promise((resolve, reject) => {
    provisionNamespace(namespace)
      .then(() => {
        watch(serviceInstanceDef(namespace.name)).then(watchListener => {
          watchListener.onEvent(handleServiceInstanceEvent.bind(null, resolve));
        });
      })
      .then(() => provisionServiceInstance(username, namespace.name))
      .catch(err => reject(err));
  });
}

const provisionNamespace = (namespace) => {
  const namespaceRes = namespaceResource({ name: namespace.name });
  const namespaceReqRes = namespaceRequestResource(namespace.displayName, { name: namespace.name });
  const namespaceCompare = resObj => resObj.metadata.name === namespace.name;
  return findOrCreateOpenshiftResource(namespaceDef, namespaceRes, namespaceCompare, namespaceRequestDef, namespaceReqRes);
}

const provisionServiceInstance = (username, namespace) => {
  const siRes = buildServiceInstanceResourceObj({ namespace: namespace, name: DEFAULT_SERVICES.FUSE, username });
  return findOrCreateOpenshiftResource(serviceInstanceDef(namespace), siRes, buildServiceInstanceCompareFn(siRes));
}

const handleServiceInstanceEvent = (resolve, event) => {
  if (event.type != OpenShiftWatchEvents.OPENED && event.type != OpenShiftWatchEvents.CLOSED && event.payload.spec.clusterServiceClassExternalName === DEFAULT_SERVICES.FUSE && event.payload.status && event.payload.status.provisionStatus === 'Provisioned') {
    resolve({
      event,
      attrs: {
        'fuse-url': event.payload.status.dashboardURL
      }
    });
  }
}

export { provisionFuseOnline }
