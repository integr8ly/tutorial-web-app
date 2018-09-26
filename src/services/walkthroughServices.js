import { watch, currentUser } from './openshiftServices';
import { buildValidProjectNamespaceName, findOrCreateOpenshiftResource } from '../common/openshiftHelpers';
import {
  buildServiceInstanceCompareFn,
  buildServiceInstanceResourceObj,
  CRUDAppInstanceTransform,
  DEFAULT_SERVICES,
  handleWalkthroughOneRoutes,
  MessagingAppServiceInstanceTransform
} from '../common/serviceInstanceHelpers';
import {
  namespaceResource,
  namespaceRequestResource,
  namespaceDef,
  namespaceRequestDef,
  serviceInstanceDef,
  routeDef
} from '../common/openshiftResourceDefinitions';

/**
 * Walkthroughs definitions, each root level object represents one walkthrough, each contains:
 * - suffix of the namespace ${username}-${suffix}
 * - list of services needed for the walkthrough, listed by service catalog names
 * - ServiceInstances transforms allowing to customise the services e.g. add parameters
 */
const walkthroughs = {
  one: {
    namespaceSuffix: 'walkthrough-one',
    services: [DEFAULT_SERVICES.CRUD_APP, DEFAULT_SERVICES.MESSAGING_APP],
    transforms: [new CRUDAppInstanceTransform(), new MessagingAppServiceInstanceTransform()],
    watchers: [
      {
        resource: namespace => routeDef(namespace),
        handlerFn: handleWalkthroughOneRoutes
      }
    ]
  },
  oneA: {
    namespaceSuffix: 'walkthrough-one-a',
    services: [DEFAULT_SERVICES.CRUD_APP, DEFAULT_SERVICES.MESSAGING_APP],
    transforms: [new CRUDAppInstanceTransform(), new MessagingAppServiceInstanceTransform()],
    watchers: [
      {
        resource: namespace => routeDef(namespace),
        handlerFn: handleWalkthroughOneRoutes
      }
    ]
  }
};

/**
 * Prepare namespace for the given walkthrough:
 * - Setup a user-specific projects namespace if it doesn't already exist. This
 *   will house the users services.
 * - Provision one of each walkthrough services into the namespace
 * @param dispatch
 * @param walkthrough
 * @param siInfoOtherData other data that will be added as siInfo.otherData ={} object, can be used to pass data into transforms
 */
const prepareWalkthroughNamespace = (dispatch, walkthrough, siInfoOtherData) => {
  if (!window.OPENSHIFT_CONFIG.mockData) {
    return currentUser().then(user => {
      const userNamespace = buildValidProjectNamespaceName(user.username, walkthrough.namespaceSuffix);
      const namespaceObj = namespaceResource(userNamespace);
      const namespaceRequestObj = namespaceRequestResource(userNamespace);

      findOrCreateOpenshiftResource(
        namespaceDef,
        namespaceObj,
        resObj => resObj.metadata.name === userNamespace,
        namespaceRequestDef,
        namespaceRequestObj
      )
        .then(() => {
          const siObjs = walkthrough.services.map(name =>
            buildServiceInstanceResourceObj(
              {
                namespace: userNamespace,
                name,
                user,
                otherData: siInfoOtherData
              },
              walkthrough.transforms
            )
          );
          return Promise.all(
            siObjs.map(siObj =>
              findOrCreateOpenshiftResource(
                serviceInstanceDef(userNamespace),
                siObj,
                buildServiceInstanceCompareFn(siObj)
              )
            )
          );
        })
        .then(() => {
          walkthrough.watchers.forEach(watcher => {
            watch(watcher.resource(userNamespace)).then(watchListener =>
              watchListener.onEvent(watcher.handlerFn.bind(null, dispatch))
            );
          });
        });
    });
  }
  return null;
};

export { prepareWalkthroughNamespace, walkthroughs };
