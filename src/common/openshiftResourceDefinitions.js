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
const templateDef = namespace => ({
  version: 'v1',
  namespace,
  api: 'oapi'
});
const processedTemplateDefV4 = namespace => ({
  name: 'processedtemplates',
  namespace,
  version: 'v1',
  group: 'template.openshift.io'
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
const syndesisDef = namespace => ({
  name: 'syndesises',
  namespace,
  version: 'v1alpha1',
  group: 'syndesis.io'
});
const packageManifestDef = namespace => ({
  name: 'packagemanifests',
  namespace,
  version: 'v1',
  group: 'packages.operators.coreos.com'
});
const catalogSourceConfigDef = namespace => ({
  kind: 'CatalogSourceConfig',
  name: 'catalogsourceconfigs',
  namespace,
  version: 'v1',
  group: 'operators.coreos.com'
});
const operatorGroupDef = namespace => ({
  name: 'operatorgroups',
  namespace,
  version: 'v1',
  group: 'operators.coreos.com'
});
const subscriptionDef = namespace => ({
  name: 'subscriptions',
  namespace,
  version: 'v1alpha1',
  group: 'operators.coreos.com'
});
const csvDef = namespace => ({
  name: 'clusterserviceversions',
  namespace,
  version: 'v1alpha1',
  group: 'operators.coreos.com'
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
  templateDef,
  addressSpaceDef,
  messagingUserDef,
  syndesisDef,
  packageManifestDef,
  catalogSourceConfigDef,
  operatorGroupDef,
  subscriptionDef,
  csvDef,
  processedTemplateDefV4
};
