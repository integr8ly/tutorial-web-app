import axios from 'axios';
import ClientOAuth2 from 'client-oauth2';

const KIND_ROUTE = 'Route';

axios.interceptors.response.use(
  response => response,
  err => {
    if (err.response.status === 401) {
      return startOAuth();
    }
    return err;
  }
);

class OpenShiftUser {
  constructor(userRes) {
    this.uid = userRes.metadata.uid;
    this.username = userRes.metadata.name;
    this.fullName = userRes.fullName;
    window.localStorage.setItem('currentUserName', this.fullName ? this.fullName : this.username);
  }
}

const OpenShiftWatchEvents = Object.freeze({
  MODIFIED: 'MODIFIED',
  ADDED: 'ADDED',
  DELETED: 'DELETED',
  OPENED: 'OPENED',
  CLOSED: 'CLOSED'
});

class OpenShiftWatchEventListener {
  _handler = () => {};
  _errorHandler = () => {};

  constructor(socket) {
    this._socket = socket;
  }

  init() {
    this._socket.onmessage = event => {
      const data = JSON.parse(event.data);
      this._handler({ type: data.type, payload: data.object });
    };
    this._socket.oncreate = () => this._handler({ type: OpenShiftWatchEvents.OPENED });
    this._socket.onclose = () => this._handler({ type: OpenShiftWatchEvents.CLOSED });
    this._socket.onerror = err => this._errorHandler(err);
    return this;
  }

  onEvent(handler) {
    this._handler = handler;
    return this;
  }

  catch(handler) {
    this._errorHandler = handler;
    return this;
  }
}

class OpenShiftPollEventListener {
  _handler = () => {};
  _errorHandler = () => {};

  constructor(request) {
    this._request = request;
  }

  init(interval) {
    this._interval = setInterval(
      () =>
        axios(this._request)
          .then(resp => {
            if (!resp || !resp.data || !resp.data.items) {
              this._errorHandler(new Error('could not get resource list from response'));
              return;
            }
            resp.data.items.forEach(i => this._handler(i));
          })
          .catch(err => this._errorHandler(err)),
      interval
    );
    return this;
  }

  onEvent(handler) {
    this._handler = handler;
    return this;
  }

  catch(handler) {
    this._errorHandler = handler;
    return this;
  }

  clear() {
    if (this._interval) {
      clearInterval(this._interval);
    }
  }
}

const getUser = () => {
  // Don't start the OAuth flow when in mock mode. Just resolve an empty user
  if (window.OPENSHIFT_CONFIG.mockData) {
    return new Promise(resolve => resolve({}));
  }
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
    return startOAuth();
  }
  return new Promise((resolve, reject) => resolve(user));
};

/**
 * Saves the user to local storage for retrieval of the token later as needed
 * @param {User} user
 */
const setUser = user => {
  if (!user) {
    window.localStorage.setItem('OpenShiftUser', null);
    window.localStorage.removeItem('currentUserName');
    return;
  }
  window.localStorage.setItem('OpenShiftUser', JSON.stringify(user));
  window.localStorage.setItem('currentUserName', user.fullName ? user.fullName : user.username);
};

/**
 * Internal function to construct an oauth client from the oauth lib.
 */
const getOauthClient = () =>
  new ClientOAuth2({
    clientId: window.OPENSHIFT_CONFIG.clientId,
    accessTokenUri: window.OPENSHIFT_CONFIG.accessTokenUri,
    authorizationUri: window.OPENSHIFT_CONFIG.authorizationUri,
    redirectUri: `${window.OPENSHIFT_CONFIG.redirectUri}?then=${window.location.href}`,
    scopes: window.OPENSHIFT_CONFIG.scopes
  });

/**
 * Starts the OAuth flow, loading the configured authorize url.
 * Shouldn't need to be called manually.
 * This is called automatically by the library internals if an
 * API call is attempted and there is no user details/access token.
 */
const startOAuth = () => {
  const openshiftAuth = getOauthClient();
  window.location = openshiftAuth.token.getUri();
};

/**
 * Finish the oauth flow, retrieving the access token, and passing
 * data back to the user in a Promise.
 * The returned object has 2 keys: `user` & `then`
 * `user` has the access_token and some other user data
 * `then` has the original url from before the oauth flow started
 *  (useful if you want to restore the route the user was on)
 * @returns {Promise<AuthData>}
 */
const finishOAuth = () => {
  const openshiftAuth = getOauthClient();

  return openshiftAuth.token.getToken(window.location.href).then(user => {
    setUser(user.data);
    const then = getParameterByName('then');
    return {
      user,
      then
    };
  });
};

/**
 * Removes the user session from local storage.
 * Doing this will trigger an oauth flow the next time
 * the library is used. It is recommended to handle the
 * logout state change in your App by navigating elsewhere
 * or reloading your App.
 */
const logout = () => deleteCurrentSessionAuthToken().then(() => setUser(null));

/**
 * Retrieve a single parameter value from a URL that contains a query string
 * @param {string} name The parameter name to get
 * @param {string} url The full URL that includes the query string
 * @returns {string} The parameter value
 */
const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  // eslint-disable-next-line no-useless-escape
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

const currentUser = () =>
  getUser().then(user =>
    axios({
      url: `${window.OPENSHIFT_CONFIG.masterUri}/oapi/v1/users/~`,
      headers: {
        authorization: `Bearer ${user.access_token}`
      }
    }).then(response => new OpenShiftUser(response.data))
  );

const get = (res, name) =>
  getUser().then(user =>
    axios({
      url: `${window.OPENSHIFT_CONFIG.masterUri}/apis/${res.group}/${res.version}/namespaces/${res.namespace}/${
        res.name
      }/${name}`,
      headers: {
        authorization: `Bearer ${user.access_token}`
      }
    }).then(response => response.data)
  );

const deleteCurrentSessionAuthToken = () =>
  getUser().then(user =>
    axios({
      url: `${window.OPENSHIFT_CONFIG.masterUri}/apis/oauth.openshift.io/v1/oauthaccesstokens/${user.access_token}`,
      method: 'delete',
      headers: {
        authorization: `Bearer ${user.access_token}`,
        'content-type': 'application/json'
      }
    })
  );

const update = (res, obj) =>
  getUser().then(user => {
    const requestUrl = _buildRequestUrl(res);

    if (!obj.apiVersion) {
      obj.apiVersion = res.group ? `${res.group}/${res.version}` : res.version;
    }

    return axios({
      url: `${requestUrl}/${obj.metadata.name}`,
      method: 'PUT',
      data: obj,
      headers: {
        authorization: `Bearer ${user.access_token}`
      }
    }).then(response => response.data);
  });

const list = res =>
  getUser().then(user =>
    axios({
      url: _buildRequestUrl(res),
      headers: {
        authorization: `Bearer ${user.access_token}`
      }
    }).then(response => response.data)
  );

const create = (res, obj) =>
  getUser().then(user => {
    const requestUrl = _buildRequestUrl(res);

    if (!obj.apiVersion) {
      obj.apiVersion = res.group ? `${res.group}/${res.version}` : res.version;
    }

    return axios({
      url: requestUrl,
      method: 'POST',
      data: obj,
      headers: {
        authorization: `Bearer ${user.access_token}`
      }
    }).then(response => response.data);
  });

const remove = (res, obj) =>
  getUser().then(user => {
    const requestUrl = _buildRequestUrl(res);

    if (!obj.apiVersion) {
      obj.apiVersion = res.group ? `${res.group}/${res.version}` : res.version;
    }

    return axios({
      url: `${requestUrl}/${obj.metadata.name}`,
      method: 'DELETE',
      data: {
        apiVersion: obj.apiVersion,
        kind: 'DeleteOptions',
        propogationPolicy: 'Foreground'
      },
      headers: {
        authorization: `Bearer ${user.access_token}`
      }
    }).then(response => response.data);
  });

const poll = (res, interval) =>
  getUser().then(user => {
    const reqUrl = `${_buildRequestUrl(res)}?watch=true`;
    return Promise.resolve(
      new OpenShiftPollEventListener({
        url: reqUrl,
        method: 'GET',
        headers: {
          authorization: `Bearer ${user.access_token}`
        }
      }).init(interval || 1000)
    );
  });

const watch = res =>
  getUser().then(user => {
    const walkthroughsUrl = _buildWatchUrl(res);
    const base64token = window.btoa(user.access_token).replace(/=/g, '');
    const socket = new WebSocket(walkthroughsUrl, [`base64url.bearer.authorization.k8s.io.${base64token}`, null]);

    return Promise.resolve(new OpenShiftWatchEventListener(socket).init());
  });

const _buildOpenshiftApiUrl = (baseUrl, res) => (res.group ? `${baseUrl}/apis/${res.group}` : `${baseUrl}/api`);

const _buildOpenShiftUrl = (baseUrl, res) => {
  const urlBegin = `${_buildOpenshiftApiUrl(baseUrl, res)}/${res.version}`;
  if (res.namespace) {
    return `${urlBegin}/namespaces/${res.namespace}/${res.name}`;
  }
  return `${urlBegin}/${res.name}`;
};

const _buildRequestUrl = res => `${_buildOpenShiftUrl(window.OPENSHIFT_CONFIG.masterUri, res)}`;

const _buildWatchUrl = res => `${_buildOpenShiftUrl(window.OPENSHIFT_CONFIG.wssMasterUri, res)}?watch=true`;

export {
  finishOAuth,
  currentUser,
  get,
  create,
  list,
  watch,
  update,
  remove,
  OpenShiftWatchEvents,
  logout,
  getUser,
  poll,
  KIND_ROUTE
};
