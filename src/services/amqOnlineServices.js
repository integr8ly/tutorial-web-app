import { serviceInstanceDef, secretDef } from '../common/openshiftResourceDefinitions';
import {
  buildServiceInstanceResourceObj,
  DEFAULT_SERVICES,
  buildServiceInstanceCompareFn
} from '../common/serviceInstanceHelpers';
import { handleEnmasseServiceInstanceWatchEvents } from '../services/middlewareServices';
import { watch, OpenShiftWatchEvents } from './openshiftServices';
import { findOrCreateOpenshiftResource } from '../common/openshiftHelpers';

const provisionAMQOnline = (dispatch, username, namespace) =>
  new Promise((resolve, reject) => {
    provisionServiceInstance(username, namespace.name)
      .then(() => {
        watch(serviceInstanceDef(namespace.name)).then(watchListener => {
          watchListener.onEvent(handleEnmasseServiceInstanceWatchEvents.bind(null, dispatch));
        });
        watch(secretDef(namespace.name)).then(watchListener => {
          watchListener.onEvent(handleCredentialsSecretEvent.bind(null, resolve));
        });
      })
      .catch(err => reject(err));
  });

const provisionServiceInstance = (username, namespace) => {
  const siRes = buildServiceInstanceResourceObj({ namespace, name: DEFAULT_SERVICES.ENMASSE, username });
  return findOrCreateOpenshiftResource(serviceInstanceDef(namespace), siRes, buildServiceInstanceCompareFn(siRes));
};

const handleCredentialsSecretEvent = (resolve, event) => {
  if (
    event.type === OpenShiftWatchEvents.OPENED ||
    event.type === OpenShiftWatchEvents.CLOSED ||
    event.type === OpenShiftWatchEvents.DELETED
  ) {
    return;
  }

  const secret = event.payload;
  if (secret.metadata.name.includes('amq-online-standard') && secret.metadata.name.includes('credentials')) {
    const amqpHost = window.atob(secret.data.messagingHost);
    const username = window.atob(secret.data.username);
    const password = window.atob(secret.data.password);

    resolve({
      'enmasse-broker-url': amqpHost,
      'enmasse-credentials-username': username,
      'enmasse-credentials-password': password
    });
  }
};

export { provisionAMQOnline };
