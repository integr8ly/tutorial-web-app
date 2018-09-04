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
  static listProvisionedServices() {
    const services = [
      {
        appName: 'Red Hat Fuse Online',
        appDescription:
          'An integration Platform-as-a-Service (iPaaS) solution that makes it easy for business users to collaborate with integration experts and application developers.  Both low-code environment and developer-focused features are available in this environment.',
        appLink: `${process.env.REACT_APP_FUSE_URL}`
      },
      {
        appName: 'Red Hat Launcher',
        appDescription: 'Continuous application delivery, built and deployed on OpenShift.',
        appLink: `${process.env.REACT_APP_LAUNCHER_URL}`
      },
      {
        appName: 'Eclipse Che',
        appDescription: 'A developer workspace server and cloud IDE.',
        appLink: `${process.env.REACT_APP_CHE_URL}`
      },
      {
        appName: 'EnMasse',
        appDescription: 'Managed, self-service messaging on Kubernetes.',
        appLink: `${process.env.REACT_APP_ENMASSE_URL}`
      }
    ];

    return Promise.resolve(services);
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
