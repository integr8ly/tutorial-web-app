export default class ProvisionedService {
  /**
   * Construct a new {@link ProvisionedService}.
   * @constructor
   * @param {string} name The unique name of the service
   * @param {string} appLink The dashboard URL of the service
   * @param {ClusterServiceClass} service The cluster service class
   */
  constructor(name, appLink, service) {
    this.name = name;
    this.appLink = appLink;
    this.service = service;

    // TODO: Lookup these details based on the unique service class name
    this.appName = name;
    this.appDescription = name;
  }
}
