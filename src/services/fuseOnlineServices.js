import { serviceInstanceDef } from '../common/openshiftResourceDefinitions';
import {
  DEFAULT_SERVICES,
  buildServiceInstanceCompareFn,
  buildServiceInstanceResourceObj
} from '../common/serviceInstanceHelpers';
import { watch, OpenShiftWatchEvents, getUser, currentUser } from './openshiftServices';
import { findOrCreateOpenshiftResource } from '../common/openshiftHelpers';
import { SERVICE_TYPES, SERVICE_STATUSES } from '../redux/constants/middlewareConstants';
import { FULFILLED_ACTION } from '../redux/helpers';
import { middlewareTypes } from '../redux/constants';

const provisionFuseOnlineV4 = dispatch =>
  new Promise((resolve, reject) => {
    const { provisionedServices = {} } = window.OPENSHIFT_CONFIG || {};
    const { Host } = provisionedServices[DEFAULT_SERVICES.FUSE_MANAGED] || {};
    if (Host) {
      currentUser().then(user => {
        const perUserHost = Host.replace('redhat-rhmi-fuse', user.username);

        const synInfo = Object.assign(
          {},
          {
            name: DEFAULT_SERVICES.FUSE,
            status: SERVICE_STATUSES.PROVISIONED,
            type: SERVICE_TYPES.PROVISIONED_SERVICE,
            url: perUserHost
          }
        );

        dispatch({
          type: FULFILLED_ACTION(middlewareTypes.PROVISION_SERVICE),
          payload: synInfo
        });

        resolve(synInfo);
      });
    } else {
      console.error(new Error(`Host is unavailable for ${DEFAULT_SERVICES.FUSE_MANAGED}`));
      dispatch({
        type: FULFILLED_ACTION(middlewareTypes.PROVISION_SERVICE),
        payload: getBasePayload({ status: SERVICE_STATUSES.UNAVAILABLE })
      });
    }
  });

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
