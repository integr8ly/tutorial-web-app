export default class ServiceInstance {
  constructor(name, consoleURL, clusterServiceClassId) {
    this.name = name;
    this.consoleURL = consoleURL;
    this.clusterServiceClassId = clusterServiceClassId;
  }

  static fromJSON(jsonData) {
    const { name } = jsonData.metadata;
    const consoleURL = jsonData.status.dashboardURL;
    const clusterServiceClassId = jsonData.spec.clusterServiceClassRef.name;

    return new ServiceInstance(name, consoleURL, clusterServiceClassId);
  }
}
