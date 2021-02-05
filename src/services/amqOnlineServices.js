// import {
//   addressSpaceDef,
//   messagingUserDef,
//   serviceInstanceDef,
//   secretDef
// } from '../common/openshiftResourceDefinitions';
// import { poll, watch, OpenShiftWatchEvents } from './openshiftServices';
// import { findOrCreateOpenshiftResource, cleanUsername } from '../common/openshiftHelpers';
// import { middlewareTypes } from '../redux/constants';
// import { FULFILLED_ACTION } from '../redux/helpers';
// import {
//   DEFAULT_SERVICES,
//   buildServiceInstanceResourceObj,
//   buildServiceInstanceCompareFn
// } from '../common/serviceInstanceHelpers';
// import { SERVICE_STATUSES, SERVICE_TYPES } from '../redux/constants/middlewareConstants';
// import { handleEnmasseServiceInstanceWatchEvents } from './middlewareServices';
// import { provisionOperator } from './operatorServices';

// const MANIFEST_NAME = 'integreatly-amq-online';

// const watchAMQOnline = (dispatch, username, namespace) =>
//   poll(addressSpaceDef(namespace), 5000, 2000).then(pollListener => {
//     pollListener.onEvent(event => {
//       if (!event || !event.metadata || !event.metadata.name === cleanUsername(username)) {
//         dispatch(getPayloadFromAddressSpace(event, username, namespace));
//         return;
//       }
//       const payload = getPayloadFromAddressSpace(event, username, namespace);
//       payload.additionalAttributes = Object.assign({}, payload.additionalAttributes, {
//         'enmasse-credentials-username': cleanUsername(username),
//         'enmasse-credentials-password': window.atob(genEvalPassword(username))
//       });
//       dispatch({
//         type: FULFILLED_ACTION(middlewareTypes.PROVISION_SERVICE),
//         payload
//       });
//     });
//   });

// const getDefaultProvisionAMQOpts = () => ({
//   createSubscription: false
// });

// // OpenShift 4 equivalent of #provisionAMQOnline
// const provisionAMQOnlineV4 = (dispatch, username, namespace, opts = getDefaultProvisionAMQOpts()) =>
//   new Promise((resolve, reject) => {
//     console.log(
//       `dispatching PROVISION_SERVICE for service ${DEFAULT_SERVICES.ENMASSE} with status ${
//         SERVICE_STATUSES.PROVISIONING
//       }`
//     );
//     dispatch({
//       type: FULFILLED_ACTION(middlewareTypes.PROVISION_SERVICE),
//       payload: getBasePayload({ status: SERVICE_STATUSES.PROVISIONING })
//     });
//     let initialStep;
//     if (opts.createSubscription) {
//       initialStep = provisionOperator(MANIFEST_NAME, namespace).then(() => provisionAddressSpace(username, namespace));
//     } else {
//       initialStep = provisionAddressSpace(username, namespace);
//     }
//     initialStep
//       // wait for addressspace to be created
//       .then(() => {
//         console.log(`waiting for addressspace ${username} to exist`);
//         /* eslint-disable no-shadow */
//         return new Promise(resolve => {
//           poll(addressSpaceDef(namespace)).then(listener => {
//             listener.onEvent(as => {
//               if (!as.metadata.name === username) {
//                 return;
//               }
//               resolve(as);
//             });
//           });
//         });
//         /* eslint-enable no-shadow */
//       })
//       .then(() => provisionMessagingUser(username, namespace))
//       .then(() =>
//         poll(addressSpaceDef(namespace)).then(pollListener => {
//           pollListener.onEvent(
//             handleAddressSpaceUpdateEvent.bind(null, username, namespace, dispatch, amqInfo => {
//               pollListener.clear();
//               dispatch({
//                 type: FULFILLED_ACTION(middlewareTypes.PROVISION_SERVICE),
//                 payload: amqInfo
//               });
//               resolve(amqInfo);
//             })
//           );
//           pollListener.catch(err => console.error(err));
//         })
//       )
//       .catch(err => reject(err));
//   });

// const provisionMessagingUser = (username, namespace) => {
//   const cleanUser = cleanUsername(username);
//   const password = genEvalPassword(username);
//   const muRes = {
//     apiVersion: 'user.enmasse.io/v1beta1',
//     kind: 'MessagingUser',
//     metadata: {
//       name: `${cleanUser}.${cleanUser}`,
//       namespace
//     },
//     spec: {
//       username: cleanUser,
//       authentication: {
//         type: 'password',
//         password
//       },
//       authorization: [
//         {
//           addresses: ['*'],
//           operations: ['send', 'recv', 'view', 'manage']
//         }
//       ]
//     }
//   };
//   return findOrCreateOpenshiftResource(messagingUserDef(namespace), muRes);
// };

// const provisionAddressSpace = (username, namespace) => {
//   const asRes = {
//     apiVersion: 'enmasse.io/v1beta1',
//     kind: 'AddressSpace',
//     metadata: {
//       name: cleanUsername(username),
//       namespace
//     },
//     spec: {
//       type: 'standard',
//       plan: 'standard-unlimited'
//     }
//   };
//   return findOrCreateOpenshiftResource(addressSpaceDef(namespace), asRes);
// };

// const handleAddressSpaceUpdateEvent = (username, namespace, dispatch, resolve, event) => {
//   if (!event || !event.status || !event.status.isReady) {
//     dispatch(getPayloadFromAddressSpace(event, username, namespace));
//     return;
//   }
//   const messagingEndpointDef = event.status.endpointStatuses.find(e => e.name === 'messaging');
//   if (!messagingEndpointDef) {
//     return;
//   }
//   const payload = getPayloadFromAddressSpace(event, username, namespace);
//   payload.additionalAttributes = Object.assign({}, payload.additionalAttributes, {
//     'enmasse-credentials-username': cleanUsername(username),
//     'enmasse-credentials-password': window.atob(genEvalPassword(username))
//   });
//   resolve(payload);
// };

// const buildAMQOnlineConcoleUrl = (username, namespace, type) => {
//   if (!window.OPENSHIFT_CONFIG.provisionedServices.amqonline) {
//     return null;
//   }
//   const baseUrl = `${window.OPENSHIFT_CONFIG.provisionedServices.amqonline.Host}`;
//   return `${baseUrl}/#/address-spaces/${namespace}/${username}/${type}/addresses`;
// };

// const getPayloadFromAddressSpace = (as, username, namespace) => {
//   const payload = {
//     type: SERVICE_TYPES.PROVISIONED_SERVICE,
//     name: DEFAULT_SERVICES.ENMASSE
//   };
//   if (!as) {
//     return Object.assign({}, payload, { status: SERVICE_STATUSES.UNAVAILABLE });
//   }
//   if (!as.status || !as.status.isReady) {
//     return Object.assign({}, payload, { status: SERVICE_STATUSES.PROVISIONING });
//   }
//   const messagingEndpointDef = as.status.endpointStatuses.find(e => e.name === 'messaging');
//   if (!messagingEndpointDef) {
//     return null;
//   }
//   let consoleEndpointDef = as.status.endpointStatuses.find(e => e.name === 'console');
//   if (!consoleEndpointDef) {
//     // If the host endpoint is not in the status, we can generate the URL from the
//     // username and namespace
//     const type = as.spec.type || 'standard';
//     consoleEndpointDef = {
//       externalHost: buildAMQOnlineConcoleUrl(username, namespace, type)
//     };
//   }

//   const addressSpaceUrl =
//     consoleEndpointDef.externalHost.indexOf('https://') === 0
//       ? `${consoleEndpointDef.externalHost}`
//       : `https://${consoleEndpointDef.externalHost}`;

//   return Object.assign({}, payload, {
//     status: SERVICE_STATUSES.PROVISIONED,
//     url: addressSpaceUrl,
//     additionalAttributes: {
//       'enmasse-broker-url': messagingEndpointDef.serviceHost
//     }
//   });
// };

// const getBasePayload = mergeWith =>
//   Object.assign(
//     {},
//     {
//       type: SERVICE_TYPES.PROVISIONED_SERVICE,
//       name: DEFAULT_SERVICES.ENMASSE,
//       status: SERVICE_STATUSES.UNAVAILABLE
//     },
//     mergeWith
//   );

// // Provision AMQ Online in an OpenShift 3 environment
// const provisionAMQOnline = (dispatch, username, namespace) =>
//   new Promise((resolve, reject) => {
//     provisionServiceInstance(username, namespace.name)
//       .then(() => {
//         watch(serviceInstanceDef(namespace.name)).then(watchListener => {
//           watchListener.onEvent(handleEnmasseServiceInstanceWatchEvents.bind(null, dispatch));
//         });
//         watch(secretDef(namespace.name)).then(watchListener => {
//           watchListener.onEvent(handleCredentialsSecretEvent.bind(null, resolve));
//         });
//       })
//       .catch(err => reject(err));
//   });

// const provisionServiceInstance = (username, namespace) => {
//   const siRes = buildServiceInstanceResourceObj({ namespace, name: DEFAULT_SERVICES.ENMASSE, username });
//   return findOrCreateOpenshiftResource(serviceInstanceDef(namespace), siRes, buildServiceInstanceCompareFn(siRes));
// };

// const handleCredentialsSecretEvent = (resolve, event) => {
//   if (
//     event.type === OpenShiftWatchEvents.OPENED ||
//     event.type === OpenShiftWatchEvents.CLOSED ||
//     event.type === OpenShiftWatchEvents.DELETED
//   ) {
//     return;
//   }

//   const secret = event.payload;
//   if (secret.metadata.name.includes('amq-online-standard') && secret.metadata.name.includes('credentials')) {
//     const amqpHost = window.atob(secret.data.messagingHost);
//     const username = window.atob(secret.data.username);
//     const password = window.atob(secret.data.password);

//     resolve({
//       'enmasse-broker-url': amqpHost,
//       'enmasse-credentials-username': username,
//       'enmasse-credentials-password': password
//     });
//   }
// };

// // Generate a deterministic password, to allow multiple runs of a walkthrough
// // with the same user.
// const genEvalPassword = username => window.btoa(cleanUsername(username));

// export { provisionAMQOnline, provisionAMQOnlineV4, watchAMQOnline };
