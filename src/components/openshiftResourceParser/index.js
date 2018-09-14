import ClientOAuth2 from 'client-oauth2';
import ProvisionedServiceClient from './clients/provisioned-service-client';
import MockProvisionedServiceClient from './clients/mock-provisioned-service-client';

/**
 * Provides a set of functions for retrieving various OpenShift resources and
 * parsing them into a specific format.
 */
export default class OpenShiftResourceParser {
  /**
   * Construct a new {@link OpenShiftResourceParser}
   * @param {Object} config Configuration for the parser.
   * @param {boolean} config.mockData Whether the parser should use mock data or not. If true, all other config is ignored.
   * @param {clientId} config.clientId ID of the OAuthClient in OpenShift
   * @param {accessTokenUri} config.accessTokenUri : Access Token URI in OpenShift
   * @param {authorizationUri} config.authorizationUri : Authorization URI in OpenShift
   * @param {redirectUri} config.redirectUri : Redirect URI for the OAuth Flow after retrieving a token
   * @param {scopes} config.scopes : User Scopes to request in the OAuth Flow
   * @param {masterUri} config.masterUri : OpenShift Master URI for making resource API calls
   */
  constructor(config) {
    this.config = config;
    if (!this.config.mockData) {
      this.provisionedServiceClient = new ProvisionedServiceClient(this.config.masterUri, this.startOAuth.bind(this));
    }
  }

  /**
   * Attempts to load the user details from local storage, returning a Promise
   * with the user details (including the access token).
   * If there's no user or an error, the OAuth flow is started.
   * @returns {Promise<User>}
   */
  withUser() {
    let user;
    try {
      const userRaw = window.localStorage.getItem('OpenShiftUser');
      if (userRaw) {
        user = JSON.parse(userRaw);
      }
    } catch (e) {
      console.error(e);
      window.localStorage.removeItem('OpenShiftUser');
    }

    if (!user) {
      return this.startOAuth();
    }
    return new Promise((resolve, reject) => resolve(user));
  }

  /**
   * Saves the user to local storage for retrieval of the token later as needed
   * @param {User} user
   */
  static setUser(user) {
    if (!user) {
      window.localStorage.setItem('OpenShiftUser', null);
      return;
    }
    window.localStorage.setItem('OpenShiftUser', JSON.stringify(user));
  }

  /**
   * Internal function to construct an oauth client from the oauth lib.
   */
  getOauthClient() {
    return new ClientOAuth2({
      clientId: this.config.clientId,
      accessTokenUri: this.config.accessTokenUri,
      authorizationUri: this.config.authorizationUri,
      redirectUri: `${this.config.redirectUri}?then=${window.location.href}`,
      scopes: this.config.scopes
    });
  }

  /**
   * Starts the OAuth flow, loading the configured authorize url.
   * Shouldn't need to be called manually.
   * This is called automatically by the library internals if an
   * API call is attempted and there is no user details/access token.
   */
  startOAuth() {
  }

  /**
   * Finish the oauth flow, retrieving the access token, and passing
   * data back to the user in a Promise.
   * The returned object has 2 keys: `user` & `then`
   * `user` has the access_token and some other user data
   * `then` has the original url from before the oauth flow started
   *  (useful if you want to restore the route the user was on)
   * @returns {Promise<AuthData>}
   */
  finishOAuth() {
  }

  /**
   * Removes the user session from local storage.
   * Doing this will trigger an oauth flow the next time
   * the library is used. It is recommended to handle the
   * logout state change in your App by navigating elsewhere
   * or reloading your App.
   */
  static logout() {
    OpenShiftResourceParser.setUser(null);
  }

  /**
   * Retrieve a single parameter value from a URL that contains a query string
   * @param {string} name The parameter name to get
   * @param {string} url The full URL that includes the query string
   * @returns {string} The parameter value
   */
  static getParameterByName(name, url) {
    if (!url) url = window.location.href;
    // eslint-disable-next-line no-useless-escape
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  /**
   * Get a ProvisionedService from a specified namespace, by name.
   * @param {string} namespace The namespace to find the service in.
   * @param {string} serviceName The name of the service to retrieve.
   * @returns {Promise<ProvisionedService>}
   */
  getProvisionedMWService(namespace, serviceName) {
    if (this.config.mockData) {
      return MockProvisionedServiceClient.getProvisionedService();
    }

    return this.withUser().then(user =>
      this.provisionedServiceClient.getProvisionedService(user.access_token, namespace, serviceName)
    );
  }

  /**
   * Retrieve a list of provisioned services in a namespace.
   * @param {string} namespace
   * @returns {Promise<ProvisionedService>}
   */
  listProvisionedMWServices(namespace) {
    if (this.config.mockData) {
      return MockProvisionedServiceClient.listProvisionedServices(this.config.mockData);
    }

    return this.withUser().then(user =>
      this.provisionedServiceClient.listProvisionedServices(user.access_token, namespace)
    );
  }
}
