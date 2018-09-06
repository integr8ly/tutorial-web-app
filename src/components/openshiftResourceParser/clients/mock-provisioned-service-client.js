import ProvisionedService from '../types/provisioned-service';

/**
 * Mock client for retrieving and parsing Provisioned Services.
 */
export default class MockProvisionedServiceClient {
  /**
   * Retrieve a {@link ProvisionedService} from a namespace, by name.
   * @returns {Promise<ProvisionedService>}
   */
  static getProvisionedService() {
    return Promise.resolve(this.buildMockProvisionedService());
  }

  /**
   * Retrieve a randomly named {@link ProvisionedService}
   * @returns {Promise<ProvisionedService[]>}
   */
  static listProvisionedServices(mockData) {
    return Promise.resolve(mockData.listProvisionedServices);
  }

  /**
   * Create a mock provisioned service.
   * @private
   * @returns {ProvisionedService}
   */
  static buildMockProvisionedService() {
    const identifier = MockProvisionedServiceClient.randomIdentifier();
    return new ProvisionedService(
      `mock-service-${identifier}`,
      `https://mock-service-${identifier}.com/`,
      `mock-service-${identifier}-name`
    );
  }

  /**
   * Generate a random identifier for the client.
   * @private
   * @returns {number}
   */
  static randomIdentifier() {
    return Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
  }
}
