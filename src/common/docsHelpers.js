import { WALKTHOUGH_IDS } from '../services/walkthroughServices';
import { DEFAULT_SERVICES } from '../common/serviceInstanceHelpers';

const getDocsForWalkthrough = (walkthrough, middlewareServices, walkthroughServices) => {
  if (!walkthrough) {
    return {};
  }

  const middlewareAttrs = getMiddlwareServiceUrls(middlewareServices);
  const walkthroughAttrs = getWalkthroughSpecificAttrs(walkthrough, middlewareServices, walkthroughServices);

  return Object.assign({}, middlewareAttrs, walkthroughAttrs);
};

const getWalkthroughSpecificAttrs = (walkthrough, middlewareServices, walkthroughServices) => {
  if (walkthrough.id === WALKTHOUGH_IDS.ONE) {
    const crudAppName = `${walkthrough.namespaceSuffix}-${DEFAULT_SERVICES.CRUD_APP}`;
    const msgAppName = `${walkthrough.namespaceSuffix}-${DEFAULT_SERVICES.MESSAGING_APP}`;
    const { url, username, password } = middlewareServices.amqCredentials;
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

const getMiddlwareServiceUrls = middlewareServices => ({
  'fuse-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.FUSE),
  'messaging-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.AMQ),
  'launcher-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.LAUNCHER),
  'che-url': getUrlFromMiddlewareServices(middlewareServices, DEFAULT_SERVICES.CHE)
});

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

export { getDocsForWalkthrough };
