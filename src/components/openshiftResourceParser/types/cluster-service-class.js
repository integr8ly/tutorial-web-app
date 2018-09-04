export default class ClusterServiceClass {
  /**
   * Construct a new {@link ClusterServiceClass}
   * @param {string} name The identifying name of the cluster service class
   * @param {string} displayName The human-friendly name of the cluster service class
   */
  constructor(name, displayName) {
    this.name = name;
    this.displayName = displayName;
  }

  /**
   * Return whether the provided JSON data is parsable by @see fromJSON
   * This returning false does not mean the actual object is invalid in OpenShift.
   * @param {Object} jsonData The JSON object to check
   * @returns {boolean}
   */
  static isValidJSON(jsonData) {
    return (jsonData && jsonData.metadata && jsonData.metadata.name
      && jsonData.spec && jsonData.spec.externalMetadata && jsonData.spec.externalMetadata.displayName);
  }

  /**
   * Create a new {@link ClusterServiceClass} from a provided JSON object.
   * @param {Object} jsonData The JSON object to parse
   * @returns {ClusterServiceClass}
   */
  static fromJSON(jsonData) {
    return new ClusterServiceClass(jsonData.metadata.name, jsonData.spec.externalMetadata.displayName);
  }
}
