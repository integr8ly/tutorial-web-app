import {
  // serviceInstanceDef,
  syndesisDef,
  serviceInstanceDef
} from '../common/openshiftResourceDefinitions';
import {
  // buildServiceInstanceResourceObj,
  DEFAULT_SERVICES,
  buildServiceInstanceCompareFn,
  buildServiceInstanceResourceObj
  // buildServiceInstanceCompareFn
} from '../common/serviceInstanceHelpers';
import { watch, OpenShiftWatchEvents, poll } from './openshiftServices';
import { findOrCreateOpenshiftResource, cleanUsername } from '../common/openshiftHelpers';
import { SERVICE_TYPES, SERVICE_STATUSES } from '../redux/constants/middlewareConstants';
import { FULFILLED_ACTION } from '../redux/helpers';
import { middlewareTypes } from '../redux/constants';
import { provisionOperator } from './operatorServices';

const STATUS_INSTALLED = 'Installed';
const ANNOTATION_URL = 'syndesis.io/applicationUrl';

const MANIFEST_NAME = 'integreatly-syndesis';

const getDefaultProvisionFuseOpts = () => ({
  createSubscription: true
});

const provisionFuseOnlineV4 = (dispatch, username, namespace, opts = getDefaultProvisionFuseOpts()) =>
  new Promise((resolve, reject) => {
    dispatch({
      type: FULFILLED_ACTION(middlewareTypes.PROVISION_SERVICE),
      payload: getBasePayload({ status: SERVICE_STATUSES.PROVISIONING })
    });

    let initialStep;
    if (opts.createSubscription) {
      initialStep = provisionOperator(MANIFEST_NAME, namespace).then(() => provisionSyndesis(username, namespace));
    } else {
      initialStep = provisionSyndesis(username, namespace);
    }

    initialStep
      .then(syn => {
        if (!syn || !syn.status || syn.status.phase !== 'Installed') {
          console.log(`watching syndesis resources in namespace ${namespace}`);
          poll(syndesisDef(namespace)).then(listener =>
            listener.onEvent(
              handleSyndesisUpdate.bind(null, dispatch, synInfo => {
                dispatch({
                  type: FULFILLED_ACTION(middlewareTypes.PROVISION_SERVICE),
                  payload: synInfo
                });
                resolve(synInfo);
              })
            )
          );
          return;
        }
        console.log(`resolved syndesis resource ${syn.metadata.name}`, syn);
        const payload = getPayloadFromSyndesis(syn);
        resolve(payload);
      })
      .catch(err => console.error(err));
  });

const provisionSyndesis = (username, namespace) => {
  const cleanUser = cleanUsername(username);
  const synRes = {
    apiVersion: 'syndesis.io/v1alpha1',
    kind: 'Syndesis',
    metadata: {
      name: cleanUser,
      namespace
    },
    spec: {
      components: {
        db: {
          resources: {}
        },
        grafana: {
          resources: {}
        },
        meta: {
          resources: {}
        },
        prometheus: {
          resources: {}
        },
        server: {
          features: {
            exposeVia3Scale: true
          },
          resources: {}
        },
        upgrade: {
          resources: {}
        }
      },
      integration: {
        limit: 0
      }
    }
  };
  return findOrCreateOpenshiftResource(syndesisDef(namespace), synRes);
};

const getBasePayload = mergeWith =>
  Object.assign(
    {},
    {
      type: SERVICE_TYPES.PROVISIONED_SERVICE,
      name: DEFAULT_SERVICES.FUSE,
      status: SERVICE_STATUSES.UNAVAILABLE
    },
    mergeWith
  );

const getPayloadFromSyndesis = syn => {
  const payload = getBasePayload();
  if (!syn) {
    return Object.assign({}, payload);
  }
  if (
    !syn.status ||
    syn.status.phase !== STATUS_INSTALLED ||
    !syn.metadata ||
    !syn.metadata.annotations ||
    !syn.metadata.annotations[ANNOTATION_URL]
  ) {
    return Object.assign({}, payload, { status: SERVICE_STATUSES.PROVISIONING });
  }
  return Object.assign({}, payload, {
    status: SERVICE_STATUSES.PROVISIONED,
    url: syn.metadata.annotations[ANNOTATION_URL]
  });
};

/**
 * Handle an update event of a syndesis custom resource
 * @param {Object} syn a syndesis custom resource
 */
const handleSyndesisUpdate = (dispatch, onComplete, syn) => {
  const payload = getPayloadFromSyndesis(syn);
  dispatch({
    type: FULFILLED_ACTION(middlewareTypes.PROVISION_SERVICE),
    payload
  });
  if (payload.status !== SERVICE_STATUSES.PROVISIONED) {
    return;
  }
  onComplete(getPayloadFromSyndesis(syn));
};

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

export { provisionFuseOnline, provisionFuseOnlineV4 };
