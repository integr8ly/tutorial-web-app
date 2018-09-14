import { list, create, watch, currentUser, OpenShiftWatchEvents } from "./openshiftServices";
import { walkthroughTypes } from '../redux/constants';
import { FULFILLED_ACTION } from '../redux/helpers';
import { buildServiceInstanceResourceObj } from "./serviceInstanceServices";

const WALKTHROUGH_SERVICES = ['fuse', 'che', 'launcher', 'enmasse-standard'];

const mockUserWalkthrough = (dispatch, mockData) => {
  mockData.serviceInstances.forEach(si => dispatch({
    type: FULFILLED_ACTION(walkthroughTypes.CREATE_WALKTHROUGH),
    payload: si
  }));
}

const manageUserWalkthrough = (dispatch) => {
  currentUser().then(user => {
    const userNamespace = buildValidProjectNamespaceName(user.username);

    const namespaceRequestResourceDef = {
      name: 'projectrequests',
      version: 'v1',
      group: 'project.openshift.io'
    }
    const namespaceResourceDef = {
      name: 'projects',
      version: 'v1',
      group: 'project.openshift.io'
    }
    const namespaceObj = {
      kind: 'ProjectRequest',
      metadata: {
        name: userNamespace
      }
    }

    const serviceInstanceDef = {
      name: 'serviceinstances',
      namespace: userNamespace,
      version: 'v1beta1',
      group: 'servicecatalog.k8s.io'
    }

    findOpenshiftResource(namespaceResourceDef, namespaceObj)
      .then(foundResource => {
        if (!foundResource) {
          return create(namespaceRequestResourceDef, namespaceObj);
        }
        return foundResource;
      })
      .then(() => {
        const siObjs = WALKTHROUGH_SERVICES.map(name => buildServiceInstanceResourceObj({ namespace: userNamespace, name, user }));
        return Promise.all(siObjs.map(siObj => findOrCreateOpenshiftResource(serviceInstanceDef, siObj, resObj => resObj.spec.clusterServiceClassExternalName === siObj.spec.clusterServiceClassExternalName)));
      })
      .then((serviceInstances) => {
        watch(serviceInstanceDef)
          .then(watchListener => watchListener.onEvent(handleServiceInstanceWatchEvents.bind(null, dispatch)));
      });
  });
}

const handleServiceInstanceWatchEvents = (dispatch, event) => {
  if (event.type === OpenShiftWatchEvents.OPENED || event.type === OpenShiftWatchEvents.CLOSED) {
    return;
  }


  if (!WALKTHROUGH_SERVICES.includes(event.payload.spec.clusterServiceClassExternalName)) {
    return;
  }
  if (event.type === OpenShiftWatchEvents.ADDED || event.type === OpenShiftWatchEvents.MODIFIED) {
    dispatch({
      type: FULFILLED_ACTION(walkthroughTypes.CREATE_WALKTHROUGH),
      payload: event.payload
    });
  }
  if (event.type === OpenShiftWatchEvents.DELETED) {
    dispatch({
      type: FULFILLED_ACTION(walkthroughTypes.REMOVE_WALKTHROUGH),
      payload: event.payload
    });
  }
}

const findOpenshiftResource = (openshiftResourceDef, resToFind, compareFn) => {
  return list(openshiftResourceDef)
    .then(listResponse => listResponse.items)
    .then(resourceObjs => {
      const compare = compareFn || (resObj => resObj.metadata.name === resToFind.metadata.name);
      return resourceObjs.find(resObj => compare(resObj));
    })
}

const findOrCreateOpenshiftResource = (openshiftResourceDef, resToFind, compareFn) => {
  return findOpenshiftResource(openshiftResourceDef, resToFind, compareFn)
    .then(foundResource => {
      if (!foundResource) {
        return create(openshiftResourceDef, resToFind);
      }
      return Promise.resolve(foundResource);
    });
}

const buildValidProjectNamespaceName = (username) => {
  return `${cleanUsername(username)}-walkthrough-projects`
}

const cleanUsername = (username) => username.replace(/@/g, '-').replace(/\./g, '-');

export { manageUserWalkthrough, mockUserWalkthrough };
