import { WALKTHROUGH_IDS } from '../services/walkthroughServices';
import { DEFAULT_SERVICES, getDashboardUrl } from '../common/serviceInstanceHelpers';
import { buildValidProjectNamespaceName, cleanUsername } from './openshiftHelpers';

const getDocsForWalkthrough = (walkthrough, middlewareServices, walkthroughServices) => {
  if (window.OPENSHIFT_CONFIG.mockData) {
    return {};
  }

  const userAttrs = getUserAttrs(walkthrough, middlewareServices.provisioningUser);
  const middlewareAttrs = getMiddlwareServiceUrls(walkthrough, middlewareServices);

  if (!walkthrough) {
    return Object.assign({}, userAttrs, middlewareAttrs);
  }

  const walkthroughAttrs = getWalkthroughSpecificAttrs(walkthrough, middlewareServices, walkthroughServices);

  return Object.assign({}, middlewareAttrs, walkthroughAttrs, userAttrs, { 'walkthrough-id': walkthrough.id });
};

const getUserAttrs = (walkthrough, username) => ({
  'openshift-host': window.OPENSHIFT_CONFIG.masterUri,
  'project-namespace': buildValidProjectNamespaceName(username, 'walkthrough-projects'),
  'walkthrough-namespace': buildValidProjectNamespaceName(username, (walkthrough && walkthrough.namespaceSuffix) || buildValidProjectNamespaceName(username, 'walkthrough-projects')),
  'user-username': username,
  'user-sanitized-username': cleanUsername(username)
});

const getWalkthroughSpecificAttrs = (walkthrough, middlewareServices, walkthroughServices) => {
  if (walkthrough.id === WALKTHROUGH_IDS.ONE) {
    const crudAppName = `${walkthrough.namespaceSuffix}-${DEFAULT_SERVICES.CRUD_APP}`;
    const msgAppName = `${walkthrough.namespaceSuffix}-${DEFAULT_SERVICES.MESSAGING_APP}`;
    const { tcpUrl, username, password } = middlewareServices.amqCredentials;
    return {
      'spring-boot-url': getUrlFromWalkthroughServices(walkthroughServices, crudAppName),
      'node-js-url': getUrlFromWalkthroughServices(walkthroughServices, msgAppName),
      'messaging-broker-url': tcpUrl,
      'messaging-username': username,
      'messaging-password': password
    };
  }
  if (walkthrough.id === WALKTHROUGH_IDS.ONE_A) {
    const crudAppName = `${walkthrough.namespaceSuffix}-${DEFAULT_SERVICES.CRUD_APP}`;
    const msgAppName = `${walkthrough.namespaceSuffix}-${DEFAULT_SERVICES.MESSAGING_APP}`;
    const { url, username, password } = middlewareServices.enmasseCredentials;
    return {
      'spring-boot-url': getUrlFromWalkthroughServices(walkthroughServices, crudAppName),
      'node-js-url': getUrlFromWalkthroughServices(walkthroughServices, msgAppName),
      'messaging-broker-url': url,
      'messaging-username': username,
      'messaging-password': password
    };
  }
  if (walkthrough.id === WALKTHROUGH_IDS.TWO) {
    const fuseAggregatorName = `${walkthrough.namespaceSuffix}-${DEFAULT_SERVICES.FUSE_AGGREGATOR}`;
    const username = middlewareServices.provisioningUser;
    return {
      'fuse-aggregator-url': getUrlFromWalkthroughServices(walkthroughServices, fuseAggregatorName),
      'fuse-aggregator-app-name': `fuse-aggregation-app-${buildValidProjectNamespaceName(
        username,
        walkthrough.namespaceSuffix
      )}`
    };
  }
  return {};
};

const getMiddlwareServiceUrls = (walkthrough, middlewareServices) => {
  const defaultServices = {
    'openshift-app-host': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.THREESCALE).replace(
      'https://3scale-admin.',
      ''
    ),
    'fuse-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.FUSE),
    'launcher-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.LAUNCHER),
    'che-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.CHE),
    'api-management-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.THREESCALE)
  };
  if (walkthrough && walkthrough.id === WALKTHROUGH_IDS.ONE) {
    defaultServices['messaging-url'] = getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.AMQ);
  }
  if (walkthrough && walkthrough.id === WALKTHROUGH_IDS.ONE_A) {
    defaultServices['messaging-url'] = getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.ENMASSE);
  }
  return defaultServices;
};

const getUrlFromMiddlewareServices = (middlewareServices, serviceName) => {
  if (!middlewareServices || !middlewareServices.data || !middlewareServices.data[serviceName]) {
    return null;
  }
  const service = middlewareServices.data[serviceName];
  return getDashboardUrl(service);
};

const getUrlFromWalkthroughServices = (walkthroughServices, serviceName) => {
  if (!walkthroughServices || !walkthroughServices.services || !walkthroughServices.services[serviceName]) {
    return null;
  }
  return walkthroughServices.services[serviceName].spec.host;
};

export { getDocsForWalkthrough };
