import { serviceInstanceDef } from '../common/openshiftResourceDefinitions';
import {
  buildServiceInstanceResourceObj,
  DEFAULT_SERVICES,
  buildServiceInstanceCompareFn
} from '../common/serviceInstanceHelpers';
import { watch, OpenShiftWatchEvents } from './openshiftServices';
import { findOrCreateOpenshiftResource } from '../common/openshiftHelpers';

const provisionFuseOnline = (username, namespace) =>
  new Promise((resolve, reject) => {
    provisionServiceInstance(username, namespace.name)
      .then(() => {
        watch(serviceInstanceDef(namespace.name)).then(watchListener => {
          watchListener.onEvent(handleServiceInstanceEvent.bind(null, resolve));
        });
      })
      .catch(err => reject(err));
  });

const provisionServiceInstance = (username, namespace) => {
  const siRes = buildServiceInstanceResourceObj({ namespace, name: DEFAULT_SERVICES.FUSE, username });
  return findOrCreateOpenshiftResource(serviceInstanceDef(namespace), siRes, buildServiceInstanceCompareFn(siRes));
};

const handleServiceInstanceEvent = (resolve, event) => {
  if (
    event.type !== OpenShiftWatchEvents.OPENED &&
    event.type !== OpenShiftWatchEvents.CLOSED &&
    event.payload.spec.clusterServiceClassExternalName === DEFAULT_SERVICES.FUSE &&
    event.payload.status &&
    event.payload.status.provisionStatus === 'Provisioned'
  ) {
    resolve({
      event,
      attrs: {
        'fuse-url': event.payload.status.dashboardURL
      }
    });
  }
};

export { provisionFuseOnline };
