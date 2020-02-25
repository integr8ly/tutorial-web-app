import { DEFAULT_SERVICES, getDashboardUrl } from '../common/serviceInstanceHelpers';
import { buildValidProjectNamespaceName, cleanUsername } from './openshiftHelpers';
import { KIND_ROUTE } from '../services/openshiftServices';
import { SERVICE_TYPES } from '../redux/constants/middlewareConstants';

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

const getUserAttrs = (walkthroughId, username) => {
  let attrs = {
    'openshift-host':
      window.OPENSHIFT_CONFIG.openshiftVersion === 4
        ? window.OPENSHIFT_CONFIG.openshiftHost
        : window.OPENSHIFT_CONFIG.masterUri
  };
  if (username) {
    attrs = Object.assign({}, attrs, {
      'project-namespace': buildValidProjectNamespaceName(username, 'shared'),
      'user-username': username,
      'user-sanitized-username': cleanUsername(username)
    });
  }
  if (!!username && !!walkthroughId) {
    attrs = Object.assign({}, attrs, {
      'walkthrough-namespace': buildValidProjectNamespaceName(
        username,
        walkthroughId || buildValidProjectNamespaceName(username, 'shared')
      )
    });
  }
  return attrs;
};

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

const getMiddlewareServiceAttrs = middlewareServices => {
  let threescaleUrl;
  if (window.OPENSHIFT_CONFIG.threescaleWildcardDomain && window.OPENSHIFT_CONFIG.threescaleWildcardDomain.length > 0) {
    threescaleUrl = window.OPENSHIFT_CONFIG.threescaleWildcardDomain;
  } else {
    threescaleUrl = getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.THREESCALE);
  }

  const output = {
    'openshift-app-host': threescaleUrl ? threescaleUrl.replace('https://3scale-admin.', '') : threescaleUrl,
    'fuse-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.FUSE),
    'launcher-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.LAUNCHER),
    'che-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.CHE),
    'api-management-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.THREESCALE),
    'enmasse-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.ENMASSE),
    'amq-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.AMQ),
    'user-sso-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.USER_RHSSO),
    'enmasse-broker-url': middlewareServices.enmasseCredentials.url,
    'enmasse-credentials-username': middlewareServices.enmasseCredentials.username,
    'enmasse-credentials-password': middlewareServices.enmasseCredentials.password,
    'amq-broker-tcp-url': middlewareServices.amqCredentials.tcpUrl,
    'amq-broker-amqp-url': middlewareServices.amqCredentials.url,
    'amq-credentials-username': middlewareServices.amqCredentials.username,
    'amq-credentials-password': middlewareServices.amqCredentials.password,
    'apicurio-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.APICURIO)
  };

  if (window.OPENSHIFT_CONFIG && window.OPENSHIFT_CONFIG.optionalProvisionServices.length > 0) {
    window.OPENSHIFT_CONFIG.optionalProvisionServices.forEach(v => {
      output[`${v}-url`] = getUrlFromMiddlewareServices(middlewareServices, v);
    });
  }

  // Allow OpenShift 4 service additionalAttributes to be exposed
  const additionalAttrsList = Object.values(middlewareServices.data)
    .filter(svc => svc.type === SERVICE_TYPES.PROVISIONED_SERVICE)
    .map(svc => svc.additionalAttributes || {});

  return Object.assign({}, output, ...additionalAttrsList);
};

const getUrlFromMiddlewareServices = (middlewareServices, serviceName) => {
  if (!middlewareServices || !middlewareServices.data || !middlewareServices.data[serviceName]) {
    return null;
  }
  const service = middlewareServices.data[serviceName];
  return getDashboardUrl(service);
};

const getDefaultAdocAttrs = walkthroughId => ({
  imagesdir: `/walkthroughs/${walkthroughId}/files/`
});

export { getDocsForWalkthrough, getDefaultAdocAttrs };
