import axios from 'axios';
import serviceConfig from './config';
import { watch, currentUser, OpenShiftWatchEvents } from './openshiftServices';
import { initCustomThread } from './threadServices';
import { buildValidProjectNamespaceName, findOrCreateOpenshiftResource } from '../common/openshiftHelpers';
import { buildServiceInstanceCompareFn } from '../common/serviceInstanceHelpers';
import {
  namespaceResource,
  namespaceRequestResource,
  namespaceDef,
  namespaceRequestDef,
  serviceInstanceDef,
  routeDef
} from '../common/openshiftResourceDefinitions';
import { addWalkthroughService, removeWalkthroughService } from '../redux/actions/walkthroughServiceActions';
import {
  initCustomThreadPending,
  initCustomThreadSuccess,
  initCustomThreadFailure
} from '../redux/actions/threadActions';

const DEFAULT_SERVICE_INSTANCE = {
  kind: 'ServiceInstance',
  apiVersion: 'servicecatalog.k8s.io/v1beta1',
  spec: {
    clusterServicePlanExternalName: 'default'
  }
};

/**
 * Provision a namespace if it does not already exist. Once the namespace is
 * created the ServiceInstances associated with the walkthrough will be
 * provisioned in the namespace.
 *
 * @param {Function} dispatch Redux dispatch.
 * @param {string} walkthoughName The identifier of the walkthrough to provision.
 */
const prepareCustomWalkthroughNamespace = (dispatch, walkthoughName) => {
  if (window.OPENSHIFT_CONFIG.mockData) {
    return Promise.resolve([]);
  }
  dispatch(initCustomThreadPending());
  return initCustomThread(walkthoughName)
    .then(res => res.data)
    .then(manifest => {
      dispatch(initCustomThreadSuccess(manifest));
      currentUser().then(user => {
        const userNamespace = buildValidProjectNamespaceName(user.username, walkthoughName);
        const namespaceObj = namespaceResource(userNamespace);
        const namespaceRequestObj = namespaceRequestResource(userNamespace);

        return findOrCreateOpenshiftResource(
          namespaceDef,
          namespaceObj,
          resObj => resObj.metadata.name === userNamespace,
          namespaceRequestDef,
          namespaceRequestObj
        ).then(() => {
          const siObjs = manifest.dependencies.serviceInstances.map(siPartial =>
            Object.assign({}, DEFAULT_SERVICE_INSTANCE, siPartial)
          );
          return Promise.all(
            siObjs.map(siObj =>
              findOrCreateOpenshiftResource(
                serviceInstanceDef(userNamespace),
                siObj,
                buildServiceInstanceCompareFn(siObj)
              )
            )
          )
            .then(() => watch(routeDef(userNamespace)))
            .then(watchListener =>
              watchListener.onEvent(handleResourceWatchEvent.bind(null, dispatch, walkthoughName))
            );
        });
      });
    })
    .catch(e => dispatch(initCustomThreadFailure(e)));
};

/**
 * Default handle for a watch event on an OpenShift resource. If a resource is
 * of a type that can be watched/parsed by the webapp then this will dispatch
 * appropriate actions for the OpenShift resource so that it can be handled
 * elsewhere.
 *
 * @param {Function} dispatch Redux dispatch.
 * @param {string} walkthroughId The identifier for the walkthrough the resource was created from.
 * @param {Object} event Watch event.
 */
const handleResourceWatchEvent = (dispatch, walkthroughId, event) => {
  if (event.type === OpenShiftWatchEvents.OPENED || event.type === OpenShiftWatchEvents.CLOSED) {
    return;
  }
  if (event.type === OpenShiftWatchEvents.ADDED || event.type === OpenShiftWatchEvents.MODIFIED) {
    dispatch(addWalkthroughService(walkthroughId, event.payload));
    return;
  }
  if (event.type === OpenShiftWatchEvents.DELETED) {
    dispatch(removeWalkthroughService(walkthroughId, event.payload));
  }
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
 * Retrieves a list of walkthroughs from the backend.
 */
const getCustomWalkthroughs = () =>
  axios(
    serviceConfig({
      url: `/customWalkthroughs`
    })
  );

export { getWalkthrough, getCustomWalkthroughs, prepareCustomWalkthroughNamespace };
