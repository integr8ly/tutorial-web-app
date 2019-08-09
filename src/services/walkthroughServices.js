import axios from 'axios';
import Mustache from 'mustache';
import serviceConfig from './config';
import { watch, process, currentUser, OpenShiftWatchEvents } from './openshiftServices';
import { initCustomThread } from './threadServices';
import {
  buildValidProjectNamespaceName,
  findOrCreateOpenshiftResource,
  buildValidNamespaceDisplayName,
  getUsersSharedNamespaceName,
  getUsersSharedNamespaceDisplayName
} from '../common/openshiftHelpers';
import { buildServiceInstanceCompareFn, DEFAULT_SERVICES } from '../common/serviceInstanceHelpers';
import {
  namespaceResource,
  namespaceRequestResource,
  namespaceDef,
  namespaceRequestDef,
  serviceInstanceDef,
  routeDef,
  templateDef
} from '../common/openshiftResourceDefinitions';
import { addWalkthroughService, removeWalkthroughService } from '../redux/actions/walkthroughServiceActions';
import {
  initCustomThreadPending,
  initCustomThreadSuccess,
  initCustomThreadFailure
} from '../redux/actions/threadActions';
import { provisionAMQOnline } from '../services/amqOnlineServices';
import { provisionFuseOnline } from '../services/fuseOnlineServices';
import { middlewareTypes } from '../redux/constants';
import { FULFILLED_ACTION } from '../redux/helpers';

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
const prepareCustomWalkthroughNamespace = (dispatch, walkthoughName, attrs = {}) => {
  if (window.OPENSHIFT_CONFIG.mockData) {
    dispatch(initCustomThreadSuccess({}));
    return Promise.resolve([]);
  }
  dispatch(initCustomThreadPending());
  return initCustomThread(walkthoughName)
    .then(res => res.data)
    .then(manifest => {
      dispatch(initCustomThreadPending(manifest));
      currentUser().then(user => {
        const userNamespace = buildValidProjectNamespaceName(user.username, walkthoughName);
        const namespaceDisplayName = buildValidNamespaceDisplayName(user.username, walkthoughName);
        const usersSharedNamespaceName = getUsersSharedNamespaceName(user.username);
        const usersSharedNamespaceDisplayName = getUsersSharedNamespaceDisplayName(user.username);
        const namespaceObj = namespaceResource({ name: userNamespace });
        const namespaceRequestObj = namespaceRequestResource(namespaceDisplayName, { name: userNamespace });

        return findOrCreateOpenshiftResource(
          namespaceDef,
          namespaceObj,
          resObj => resObj.metadata.name === userNamespace,
          namespaceRequestDef,
          namespaceRequestObj
        )
          .then(() => {
            if (!manifest || !manifest.dependencies || !manifest.dependencies.managedServices) {
              return Promise.resolve([]);
            }
            return provisionManagedServiceSlices(dispatch, manifest.dependencies.managedServices, user.username, {
              displayName: usersSharedNamespaceDisplayName,
              name: usersSharedNamespaceName
            });
          })
          .then(additionalAttrs => {
            const mergedAttrs = Object.assign({}, attrs, ...additionalAttrs);
            if (!manifest || !manifest.dependencies || !manifest.dependencies.serviceInstances) {
              dispatch(initCustomThreadSuccess(manifest));
              return Promise.resolve([]);
            }

            const siObjs = manifest.dependencies.serviceInstances.map(siPartial => {
              const serviceInstance = Object.assign({}, DEFAULT_SERVICE_INSTANCE, siPartial);
              return parseServiceInstanceTemplate(serviceInstance, mergedAttrs);
            });
           
            // Process the template if one exists and create its objects
            if (manifest.dependencies.templates) {
              manifest.dependencies.templates.map(rawTemplate => {
                const template = parseTemplate(rawTemplate, mergedAttrs)
                return process(templateDef(userNamespace), template)
              });
            }
            
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
              )
              .then(() => dispatch(initCustomThreadSuccess(manifest)));
          });
      });
    })
    .catch(e => dispatch(initCustomThreadFailure(e)));
};

const provisionManagedServiceSlices = (dispatch, svcList, user, namespace) => {
  if (!svcList) {
    return Promise.resolve([]);
  }
  const svcProvisions = svcList.reduce((acc, svc) => {
    if (svc.name === DEFAULT_SERVICES.FUSE) {
      acc.push(
        provisionFuseOnline(user, namespace).then(provision => {
          dispatch({
            type: FULFILLED_ACTION(middlewareTypes.CREATE_WALKTHROUGH),
            payload: provision.event.payload
          });
          return provision.attrs;
        })
      );
    }
    if (svc.name === DEFAULT_SERVICES.ENMASSE) {
      acc.push(
        provisionAMQOnline(dispatch, user, namespace).then(attrs => {
          // Perform a dispatch so the Redux store will pick up on these attrs
          // and they can be used in the UI.
          dispatch({
            type: FULFILLED_ACTION(middlewareTypes.GET_ENMASSE_CREDENTIALS),
            payload: {
              url: attrs['enmasse-broker-url'],
              username: attrs['enmasse-credentials-username'],
              password: attrs['enmasse-credentials-password']
            }
          });
          return attrs;
        })
      );
    }
    return acc;
  }, []);
  // Each of these svcProvisions promises is expected to resolve to an Object
  // containing any additional attributes that should be included in
  // ServiceInstance provisioning.
  return Promise.all(svcProvisions);
};

/**
 * Replace template variables in a ServiceInstance with provided attributes.
 *
 * @param {Object} siTemplate ServiceInstance object.
 * @param {Object} attrs Key-value map of attribute names and values to replace them with.
 */
const parseServiceInstanceTemplate = (siTemplate, attrs) => {
  const rawServiceInstance = Mustache.render(JSON.stringify(siTemplate), attrs);
  return JSON.parse(rawServiceInstance);
};

/**
 * Replace template variables with provided attributes.
 *
 * @param {Object} template Openshift template object.
 * @param {Object} attrs Key-value map of attribute names and values to replace them with.
 */
const parseTemplate = (template, attrs) => {
  const rawTemplate = Mustache.render(JSON.stringify(template), attrs);
  return JSON.parse(rawTemplate);
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

/**
 * Retrieves the GitHub info for the installed walkthrough from the backend.
 */
const getWalkthroughInfo = id =>
  axios(
    serviceConfig({
      url: `/about/walkthrough/${id}`
    })
  );

/**
 * Retrieves the user-defined GitHub repositories from the database.
 */
const getUserWalkthroughs = () =>
  axios(
    serviceConfig({
      url: `/user_walkthroughs`
    })
  );

/**
 * Saves the user-defined GitHub repositories from the UI to the database.
 */
const setUserWalkthroughs = (data = {}) =>
  axios(
    serviceConfig(
      {
        method: 'post',
        url: `/user_walkthroughs`,
        data: { data }
      },
      false
    )
  ).then(success => {
    serviceConfig(
      axios({
        method: 'post',
        url: `/sync-walkthroughs`
      })
    );
  });

export {
  getWalkthrough,
  getWalkthroughInfo,
  getCustomWalkthroughs,
  prepareCustomWalkthroughNamespace,
  setUserWalkthroughs,
  getUserWalkthroughs
};
