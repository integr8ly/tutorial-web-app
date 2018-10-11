import { WALKTHROUGH_IDS } from '../services/walkthroughServices';
import { DEFAULT_SERVICES } from '../common/serviceInstanceHelpers';
import { getSsoRoute } from '../services/middlewareServices';

const getDocsForWalkthrough = (walkthrough, middlewareServices, walkthroughServices) => {
  if (!walkthrough) {
    return {};
  }

  const middlewareAttrs = getMiddlwareServiceUrls(walkthrough, middlewareServices);
  const walkthroughAttrs = getWalkthroughSpecificAttrs(walkthrough, middlewareServices, walkthroughServices);

  return Object.assign({}, middlewareAttrs, walkthroughAttrs, { 'walkthrough-id': walkthrough.id });
};

const getDocsforConfigIntegreatly = () =>
  getSsoRoute().then(route => ({ 'sso-admin-url': `https://${route.spec.host}` }));

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
  return {};
};

const getMiddlwareServiceUrls = (walkthrough, middlewareServices) => {
  const defaultServices = {
    'che-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.CHE),
    'fuse-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.FUSE),
    'launcher-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.LAUNCHER),
    'sso-url': getSsoRoute()
  };
  if (walkthrough.id === WALKTHROUGH_IDS.ONE) {
    defaultServices['messaging-url'] = getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.AMQ);
  }
  if (walkthrough.id === WALKTHROUGH_IDS.ONE_A) {
    defaultServices['messaging-url'] = getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.ENMASSE);
  }
  return defaultServices;
};

const getUrlFromMiddlewareServices = (middlewareServices, serviceName) => {
  if (!middlewareServices || !middlewareServices.data || !middlewareServices.data[serviceName]) {
    return null;
  }
  const service = middlewareServices.data[serviceName];
  return service.status.dashboardURL || service.metadata.annotations['integreatly/dashboard-url'];
};

const getUrlFromWalkthroughServices = (walkthroughServices, serviceName) => {
  if (!walkthroughServices || !walkthroughServices.services || !walkthroughServices.services[serviceName]) {
    return null;
  }
  return walkthroughServices.services[serviceName].spec.host;
};

export { getDocsForWalkthrough, getDocsforConfigIntegreatly };
