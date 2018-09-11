import OpenShiftResourceParser from '../components/openshiftResourceParser';

// TODO: Need to move Openshift Resource Parser to /src
const getMiddlewareServices = () => {
  const parser = new OpenShiftResourceParser(window.OPENSHIFT_CONFIG);
  return parser.listProvisionedMWServices('eval');
  // return parser
  //   .listProvisionedMWServices('eval')
  //   .then(provisionedServiceList => Promise.resolve({ apps: provisionedServiceList }))
  //   .catch(err => Promise.reject(err));
};

export { getMiddlewareServices };
