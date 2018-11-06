import axios from 'axios';
import serviceConfig from './config';
import { watch, currentUser } from './openshiftServices';
import { buildValidProjectNamespaceName, findOrCreateOpenshiftResource } from '../common/openshiftHelpers';
import {
  buildServiceInstanceCompareFn,
  buildServiceInstanceResourceObj,
  CRUDAppInstanceTransform,
  DEFAULT_SERVICES,
  handleWalkthroughOneRoutes,
  handleWalkthroughTwoRoutes,
  handleServiceInstancesProvision,
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
import { REJECTED_ACTION } from '../redux/helpers';
import { GET_THREAD } from '../redux/constants/threadConstants';

const WALKTHROUGH_IDS = { ONE: '1', ONE_A: '1A', TWO: '2' };

/**
 * Walkthroughs definitions, each root level object represents one walkthrough, each contains:
 * - suffix of the namespace ${username}-${suffix}
 * - list of services needed for the walkthrough, listed by service catalog names
 * - ServiceInstances transforms allowing to customise the services e.g. add parameters
 */
const walkthroughs = {
  one: {
    id: WALKTHROUGH_IDS.ONE,
    namespaceSuffix: 'walkthrough-one',
    services: [DEFAULT_SERVICES.CRUD_APP, DEFAULT_SERVICES.MESSAGING_APP],
    transforms: [new CRUDAppInstanceTransform(), new MessagingAppServiceInstanceTransform()],
    watchers: [
      {
        resource: namespace => routeDef(namespace),
        handlerFn: handleWalkthroughOneRoutes.bind(null, 'walkthrough-one')
      },
      {
        resource: namespace => serviceInstanceDef(namespace),
        handlerFn: handleServiceInstancesProvision.bind(null, 'walkthrough-one')
      }
    ]
  },
  oneA: {
    id: WALKTHROUGH_IDS.ONE_A,
    namespaceSuffix: 'walkthrough-one-a',
    services: [DEFAULT_SERVICES.CRUD_APP, DEFAULT_SERVICES.MESSAGING_APP],
    transforms: [new CRUDAppInstanceTransform(), new MessagingAppServiceInstanceTransform()],
    watchers: [
      {
        resource: namespace => routeDef(namespace),
        handlerFn: handleWalkthroughOneRoutes.bind(null, 'walkthrough-one-a')
      },
      {
        resource: namespace => serviceInstanceDef(namespace),
        handlerFn: handleServiceInstancesProvision.bind(null, 'walkthrough-one-a')
      }
    ]
  },
  two: {
    id: WALKTHROUGH_IDS.TWO,
    namespaceSuffix: 'walkthrough-two',
    services: [],
    transforms: [],
    watchers: [
      {
        resource: namespace => routeDef(namespace),
        handlerFn: handleWalkthroughTwoRoutes.bind(null, 'walkthrough-two')
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
  if (window.OPENSHIFT_CONFIG.mockData) {
    return null;
  }
  return currentUser()
    .then(user => {
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
    })
    .catch(err => {
      dispatch({
        type: REJECTED_ACTION(GET_THREAD),
        payload: {
          error: err
        }
      });
    });
};

/**
 * Retrieves the json document for a specified walkthrough (aka thread).
 * @param {} language Specifies the language end point where the json file is stored.  Used to create multiple localized documenation.
 * @param {*} id The ID for the thread.
 */
const getWalkthrough = (language, id) =>
  axios(
    serviceConfig({
      url: `${process.env.REACT_APP_STEELTHREAD_JSON_PATH}${language}/thread-${id}.json`
    })
  );

/**
 * Retrieves the json document that specifies all available walkthroughs (aka threads)
 * @param {} language Specifies the language end point where the json file is stored.  Used to create multiple localized documenation.
 */
const getWalkthroughs = language =>
  axios(
    serviceConfig({
      url: `${process.env.REACT_APP_STEELTHREAD_JSON_PATH}${language}/threads.json`
    })
  );

const getCustomWalkthroughs = () =>
  axios(
    serviceConfig({
      url: `/customWalkthroughs`
    })
  );

export {
  getWalkthrough,
  getWalkthroughs,
  prepareWalkthroughNamespace,
  walkthroughs,
  WALKTHROUGH_IDS,
  getCustomWalkthroughs
};
