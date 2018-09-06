export default class ServiceInstance {
  constructor(name, consoleURL, clusterServiceClassId, clusterServiceClassExternalName) {
    this.name = name;
    this.consoleURL = consoleURL;
    this.clusterServiceClassId = clusterServiceClassId;
    this.clusterServiceClassExternalName = clusterServiceClassExternalName;
  }

  static fromJSON(jsonData) {
    const { name } = jsonData.metadata;
    const consoleURL = jsonData.status.dashboardURL;
    const { clusterServiceClassExternalName } = jsonData.spec;
    const clusterServiceClassId = jsonData.spec.clusterServiceClassRef.name;

    return new ServiceInstance(name, consoleURL, clusterServiceClassId, clusterServiceClassExternalName);
  }
}
