const axios = require('axios');

const EMAIL_REGEX = new RegExp(
  '^(([^<>()[\\]\\\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\\\.,;:\\s@\\"]+)*)|(\\".+\\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'
);

const { GITEA_HOST, GITEA_TOKEN } = process.env;

const DEFAULT_HEADERS = {
  authorization: `token ${GITEA_TOKEN}`,
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

/**
 * Check if the username is an email address and return only
 * the name part in that case.
 * @param username Username or Email
 * @returns {*}
 */
const normalizeUser = username => {
  if (EMAIL_REGEX.test(username)) {
    return username.split('@')[0];
  }
  return username;
};

/**
 * Fetch a gitea user by username.
 * @param normalizedUser Username
 * @returns {*}
 */
const getUserIDByName = normalizedUser => {
  const url = `${GITEA_HOST}/api/v1/users/${normalizedUser}`;
  return axios({
    url,
    headers: DEFAULT_HEADERS,
    method: 'get'
  });
};

/**
 * Get gitea repository by name and user
 * @param repoName Repository name
 * @param normalizedUser Username
 * @returns {*}
 */
const getRepoByName = ({ repoName }, normalizedUser) => {
  const url = `${GITEA_HOST}/api/v1/repos/${normalizedUser}/${repoName}`;
  return axios({
    url,
    headers: DEFAULT_HEADERS,
    method: 'get'
  });
};

/**
 * Clones an externally hosted repository (e.g. Github) into a new repository on
 * gitea. A repository with that name must not exist in gitea under the specified
 * user.
 * @param repoName Repository name
 * @param cloneUrl URL to the repository to clone from
 * @param normalizedUser Username
 * @returns {Promise<any>}
 */
const cloneExternalRepo = ({ repoName, cloneUrl }, normalizedUser) => {
  const url = `${GITEA_HOST}/api/v1/repos/migrate`;
  return new Promise((resolve, reject) => {
    getUserIDByName(normalizedUser)
      .then(({ data }) => {
        const payload = {
          clone_addr: cloneUrl,
          uid: data.id,
          repo_name: repoName,
          mirror: false
        };
        axios({
          url,
          method: 'post',
          headers: DEFAULT_HEADERS,
          data: payload
        })
          .then(resolve)
          .catch(reject);
      })
      .catch(reject);
  });
};

/**
 * Creates a new empty repository on gitea with the specified name
 * @param repoName Repository name
 * @param normalizedUser Username
 * @returns {Promise<any>}
 */
const createNewRepo = ({ repoName }, normalizedUser) => {
  const url = `${GITEA_HOST}/api/v1/admin/users/${normalizedUser}/repos`;
  const data = {
    name: repoName
  };

  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url,
      data,
      headers: DEFAULT_HEADERS
    })
      .then(resolve)
      .catch(reject);
  });
};

/**
 * Create a repository for the given user. The repository argument is expected
 * to be an object with the propertiey `repoName` and `cloneUrl`. If `cloneUrl`
 * is missing, an empty repository will be created. Otherwise the repository
 * contents are cloned from the specified clone url.
 * @param username Username
 * @param repo Repository name
 * @returns {Promise<any>}
 */
exports.createRepoForUser = (username, repo) => {
  const normalizedUser = normalizeUser(username);
  return new Promise((resolve, reject) => {
    if (!GITEA_HOST || !GITEA_TOKEN) {
      return reject(new Error('Gitea is not configured. Repositories cannot be created.'));
    }

    if (!repo || !repo.repoName) {
      return reject(new Error('Repo object without name'));
    }

    return getRepoByName(repo, normalizedUser)
      .then(() => {
        console.log(`Repository ${repo.repoName} already exists`);
        return resolve();
      })
      .catch(err => {
        if (err.response && err.response.status !== 404) {
          return reject(err);
        }

        if (repo.cloneUrl) {
          console.log(`Cloning into ${repo.repoName} from ${repo.cloneUrl}`);
          return cloneExternalRepo(repo, normalizedUser)
            .then(resolve)
            .catch(reject);
        }

        console.log(`Creating new empty repository ${repo.repoName}`);
        return createNewRepo(repo, normalizedUser)
          .then(resolve)
          .catch(reject);
      });
  });
};
