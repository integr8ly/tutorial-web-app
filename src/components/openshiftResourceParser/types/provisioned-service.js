export default class ProvisionedService {
  /**
   * Construct a new {@link ProvisionedService}.
   * @constructor
   * @param {string} name The name of the service
   * @param {string} consoleURL The dashboard URL of the service
   * @param {ClusterServiceClass} service The cluster service class
   */
  constructor(name, consoleURL, service) {
    this.name = name;
    this.consoleURL = consoleURL;
    this.service = service;
  }
}
