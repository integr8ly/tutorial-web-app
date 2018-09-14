import { list, create, watch, currentUser, OpenShiftWatchEvents } from "./openshiftServices";
import { walkthroughTypes } from '../redux/constants';
import { FULFILLED_ACTION } from '../redux/helpers';
import { buildServiceInstanceResourceObj } from "./serviceInstanceServices";

const WALKTHROUGH_SERVICES = ['fuse', 'che', 'launcher', 'enmasse-standard'];

const manageUserWalkthrough = (dispatch) => {
  currentUser().then(user => {
    const userNamespace = buildValidProjectNamespaceName(user.username);

    const namespaceWalkthroughDef = {
      name: 'projectrequests',
      version: 'v1',
      group: 'project.openshift.io'
    }
    const namespaceWalkthroughObj = {
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

    findOrCreateOpenshiftResource(namespaceWalkthroughDef, namespaceWalkthroughObj)
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

const findOrCreateOpenshiftResource = (openshiftResourceDef, resToFind, compareFn) => {
  return list(openshiftResourceDef)
    .then(listResponse => listResponse.items)
    .then(resourceObjs => {
      let foundResource;
      if (compareFn) {
        foundResource = resourceObjs.find(resObj => compareFn(resObj));
      } else {
        foundResource = resourceObjs.find(resObj => resObj.metadata.name === resToFind.metadata.name)
      }
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

export { manageUserWalkthrough };
