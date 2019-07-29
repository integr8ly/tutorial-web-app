import { addressSpaceDef, messagingUserDef } from '../common/openshiftResourceDefinitions';
import { poll } from './openshiftServices';
import { findOrCreateOpenshiftResource, cleanUsername } from '../common/openshiftHelpers';
import { middlewareTypes } from '../redux/constants';
import { FULFILLED_ACTION } from '../redux/helpers';
import { DEFAULT_SERVICES } from '../common/serviceInstanceHelpers';
import { SERVICE_STATUSES, SERVICE_TYPES } from '../redux/constants/middlewareConstants';

const watchAMQOnline = (dispatch, username, namespace) =>
  poll(addressSpaceDef(namespace.name)).then(pollListener => {
    pollListener.onEvent(event => {
      if (!event || !event.metadata || !event.metadata.name === cleanUsername(username)) {
        dispatch(getPayloadFromAddressSpace(event));
        return;
      }
      dispatch({
        type: FULFILLED_ACTION(middlewareTypes.PROVISION_SERVICE),
        payload: getPayloadFromAddressSpace(event)
      });
    });
  });

const provisionAMQOnline = (dispatch, username, namespace) =>
  new Promise((resolve, reject) =>
    provisionAddressSpace(username, namespace.name)
      .then(provisionMessagingUser(username, namespace.name))
      .then(() =>
        poll(addressSpaceDef(namespace.name)).then(pollListener => {
          pollListener.onEvent(
            handleAddressSpaceUpdateEvent.bind(null, username, dispatch, amqInfo => {
              pollListener.clear();
              resolve(amqInfo);
            })
          );
          pollListener.catch(err => console.error(err));
        })
      )
      .catch(err => reject(err))
  );

const provisionMessagingUser = (username, namespace) => {
  const cleanUser = cleanUsername(username);
  const password = genEvalPassword(username);
  const muRes = {
    apiVersion: 'user.enmasse.io/v1beta1',
    kind: 'MessagingUser',
    metadata: {
      name: `${cleanUser}.${cleanUser}`,
      namespace
    },
    spec: {
      username: cleanUser,
      authentication: {
        type: 'password',
        password
      },
      authorization: [
        {
          addresses: ['*'],
          operations: ['send', 'recv', 'view', 'manage']
        }
      ]
    }
  };
  return findOrCreateOpenshiftResource(messagingUserDef(namespace), muRes);
};

const provisionAddressSpace = (username, namespace) => {
  const asRes = {
    apiVersion: 'enmasse.io/v1beta1',
    kind: 'AddressSpace',
    metadata: {
      name: cleanUsername(username),
      namespace
    },
    spec: {
      type: 'standard',
      plan: 'standard-unlimited'
    }
  };
  return findOrCreateOpenshiftResource(addressSpaceDef(namespace), asRes);
};

const handleAddressSpaceUpdateEvent = (username, dispatch, resolve, event) => {
  if (!event || !event.status || !event.status.isReady) {
    dispatch(getPayloadFromAddressSpace(event));
    return;
  }
  const messagingEndpointDef = event.status.endpointStatuses.find(e => e.name === 'messaging');
  if (!messagingEndpointDef) {
    return;
  }
  const payload = getPayloadFromAddressSpace(event);
  dispatch(payload);
  resolve({
    'enmasse-console-url': payload.url,
    'enmasse-broker-url': messagingEndpointDef.serviceHost,
    'enmasse-credentials-username': cleanUsername(username),
    'enmasse-credentials-password': window.atob(genEvalPassword(username))
  });
};

const getPayloadFromAddressSpace = as => {
  const payload = {
    type: SERVICE_TYPES.PROVISIONED_SERVICE,
    name: DEFAULT_SERVICES.ENMASSE
  };
  if (!as) {
    return Object.assign({}, payload, { status: SERVICE_STATUSES.UNAVAILABLE });
  }
  if (!as.status || !as.status.isReady) {
    return Object.assign({}, payload, { status: SERVICE_STATUSES.PROVISIONING });
  }
  const consoleEndpointDef = as.status.endpointStatuses.find(e => e.name === 'console');
  if (!consoleEndpointDef) {
    return null;
  }
  return Object.assign({}, payload, {
    status: SERVICE_STATUSES.PROVISIONED,
    url: `https://${consoleEndpointDef.externalHost}`
  });
};

// Generate a deterministic password, to allow multiple runs of a walkthrough
// with the same user.
const genEvalPassword = username => window.btoa(cleanUsername(username));

export { provisionAMQOnline, watchAMQOnline };
