const namespaceRequestDef = {
  name: 'projectrequests',
  version: 'v1',
  group: 'project.openshift.io'
};
const namespaceRequestResource = (displayName, metadata) => ({
  kind: 'ProjectRequest',
  displayName,
  metadata
});
const namespaceDef = {
  name: 'projects',
  version: 'v1',
  group: 'project.openshift.io'
};
const namespaceResource = metadata => ({
  kind: 'projects',
  metadata
});
const statefulSetDef = namespace => ({
  name: 'statefulsets',
  group: 'apps',
  version: 'v1beta1',
  namespace
});
const routeDef = namespace => ({
  name: 'routes',
  group: 'route.openshift.io',
  version: 'v1',
  namespace
});
const serviceInstanceDef = namespace => ({
  name: 'serviceinstances',
  namespace,
  version: 'v1beta1',
  group: 'servicecatalog.k8s.io'
});
const serviceDef = namespace => ({
  name: 'services',
  namespace,
  version: 'v1'
});
const secretDef = namespace => ({
  name: 'secrets',
  version: 'v1',
  namespace
});
const addressSpaceDef = namespace => ({
  name: 'addressspaces',
  namespace,
  version: 'v1beta1',
  group: 'enmasse.io'
});
const messagingUserDef = namespace => ({
  name: 'messagingusers',
  namespace,
  version: 'v1beta1',
  group: 'user.enmasse.io'
});

export {
  namespaceRequestDef,
  namespaceRequestResource,
  namespaceDef,
  serviceInstanceDef,
  namespaceResource,
  statefulSetDef,
  routeDef,
  serviceDef,
  secretDef,
  addressSpaceDef,
  messagingUserDef
};
