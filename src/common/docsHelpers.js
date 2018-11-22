import { DEFAULT_SERVICES, getDashboardUrl } from '../common/serviceInstanceHelpers';
import { buildValidProjectNamespaceName, cleanUsername } from './openshiftHelpers';
import { KIND_ROUTE } from '../services/openshiftServices';

const getDocsForWalkthrough = (walkthroughId, middlewareServices, walkthroughResources) => {
  if (window.OPENSHIFT_CONFIG.mockData) {
    return {};
  }

  const userAttrs = getUserAttrs(walkthroughId, middlewareServices.provisioningUser);
  const middlewareAttrs = getMiddlewareServiceAttrs(middlewareServices);

  if (!walkthroughId) {
    return Object.assign({}, userAttrs, middlewareAttrs);
  }
  const walkthroughAttrs = getWalkthroughSpecificAttrs(walkthroughId, walkthroughResources);
  return Object.assign({}, middlewareAttrs, walkthroughAttrs, userAttrs, { 'walkthrough-id': walkthroughId });
};

const getUserAttrs = (walkthroughId, username) => ({
  'openshift-host': window.OPENSHIFT_CONFIG.masterUri,
  'project-namespace': buildValidProjectNamespaceName(username, 'walkthrough-projects'),
  'walkthrough-namespace': buildValidProjectNamespaceName(
    username,
    walkthroughId || buildValidProjectNamespaceName(username, 'walkthrough-projects')
  ),
  'user-username': username,
  'user-sanitized-username': cleanUsername(username)
});

const getWalkthroughSpecificAttrs = (walkthroughId, walkthroughResources) =>
  Object.keys(walkthroughResources[walkthroughId] || {}).reduce((acc, resId) => {
    const res = walkthroughResources[walkthroughId][resId];
    if (res.kind === KIND_ROUTE) {
      acc = Object.assign({}, acc, retrieveRouteAttributes(resId, res));
    }
    return acc;
  }, {});

const retrieveRouteAttributes = (resourceId, route) => {
  const routeAttrs = {};
  routeAttrs[`route-${resourceId}-host`] = route.spec.tls ? `https://${route.spec.host}` : `http://${route.spec.host}`;
  return routeAttrs;
};

const getMiddlewareServiceAttrs = middlewareServices => ({
  'openshift-app-host': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.THREESCALE).replace(
    'https://3scale-admin.',
    ''
  ),
  'fuse-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.FUSE),
  'launcher-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.LAUNCHER),
  'che-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.CHE),
  'api-management-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.THREESCALE),
  'enmasse-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.ENMASSE),
  'amq-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.AMQ),
  'enmasse-broker-url': middlewareServices.enmasseCredentials.url,
  'enmasse-credentials-username': middlewareServices.enmasseCredentials.username,
  'enmasse-credentials-password': middlewareServices.enmasseCredentials.password,
  'amq-broker-url': middlewareServices.amqCredentials.tcpUrl,
  'amq-credentials-username': middlewareServices.amqCredentials.username,
  'amq-credentials-password': middlewareServices.amqCredentials.password
});

const getUrlFromMiddlewareServices = (middlewareServices, serviceName) => {
  if (!middlewareServices || !middlewareServices.data || !middlewareServices.data[serviceName]) {
    return null;
  }
  const service = middlewareServices.data[serviceName];
  return getDashboardUrl(service);
};

export { getDocsForWalkthrough };
