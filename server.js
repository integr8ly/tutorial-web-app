const express = require('express');
const path = require('path');
const url = require('url');
const fs = require('fs');
const asciidoctor = require('asciidoctor.js');
const Mustache = require('mustache');
const { fetchOpenshiftUser } = require('./server_middleware');
const giteaClient = require('./gitea_client');
const gitClient = require('./git_client');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const promMid = require('express-prometheus-middleware');
const Prometheus = require('prom-client');
const querystring = require('querystring');
const flattenDeep = require('lodash.flattendeep');
const { sync, repository, newRepository } = require('./model');

const app = express();

const adoc = asciidoctor();

app.use(bodyParser.json());

// prometheus metrics endpoint
app.use(
  promMid({
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5]
  })
);

const port = process.env.PORT || 5001;
const configPath = process.env.SERVER_EXTRA_CONFIG_FILE || '/etc/webapp/customServerConfig.json';

const DEFAULT_CUSTOM_CONFIG_DATA = {
  services: []
};

const walkthroughLocations =
  process.env.WALKTHROUGH_LOCATIONS ||
  (process.env.NODE_ENV === 'production'
    ? 'https://github.com/integr8ly/tutorial-web-app-walkthroughs'
    : '../tutorial-web-app-walkthroughs/walkthroughs');

const CONTEXT_PREAMBLE = 'preamble';
const CONTEXT_PARAGRAPH = 'paragraph';
const LOCATION_SEPARATOR = ',';
const TMP_DIR = process.env.TMP_DIR || '/tmp';

// Types of walkthrough location that can be provided.
const WALKTHROUGH_LOCATION_TYPE_GIT = 'git';
const WALKTHROUGH_LOCATION_TYPE_PATH = 'path';
const WALKTHROUGH_LOCATION_DEFAULT = {
  type: WALKTHROUGH_LOCATION_TYPE_GIT,
  commitHash: null,
  commitDate: null,
  remote: null,
  directory: null,
  header: null
};

const walkthroughs = [];

app.get('/customWalkthroughs', (req, res) => {
  res.status(200).json(walkthroughs);
});

// metric endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', Prometheus.register.contentType);
  res.end(Prometheus.register.metrics());
});

// Get all user defined walkthrough repositories
app.get('/user_walkthroughs', (req, res) => {
  return repository.findAll()
    .then(result => res.json(result))
    .catch(err => {
      console.error(err);
      return res.sendStatus(500);
    });
});

// Insert new user defined walkthrough repositories
app.post('/user_walkthroughs', (req, res) => {
  const { url } = req.body;
  return newRepository(url)
    .then(repository => res.json(repository))
    .catch(err => {
      console.error(err);
      return res.sendStatus(500);
    });
});

// Delete user defined walkthrough repository by id
app.delete('/user_walkthroughs/:id', (req, res) => {
  const { id } = req.params;
  return repository.findByPk(id)
    .then(instance => {
      return instance.destroy()
        .then(() => res.sendStatus(200))
        .catch(err => {
          console.error(err);
          return res.sendStatus(500);
        });
    }).catch(err => {
      console.error(err);
      return res.sendStatus(500);
    })
});

// Init custom walkthroughs dependencies
app.post('/initThread', fetchOpenshiftUser, (req, res) => {
  if (!req.body || !req.body.dependencies) {
    console.warn('Dependencies not provided in request body. Skipping thread initialization.');
    res.sendStatus(200);
    return;
  }
  const {
    dependencies: { repos },
    openshiftUser
  } = req.body;

  // Return success in mock mode without actually creating any repositories
  if (!process.env.OPENSHIFT_HOST) {
    console.warn('OPENSHIFT_HOST not set. Skipping thread initialization.');
    res.sendStatus(200);
    return;
  }

  if (!repos || repos.length === 0) {
    res.sendStatus(200);
    return;
  }

  // eslint-disable-next-line consistent-return
  return Promise.all(repos.map(repo => giteaClient.createRepoForUser(openshiftUser, repo)))
    .then(() => res.sendStatus(200))
    .catch(err => {
      console.error(`Error creating repositories: ${err}`);
      return res.status(500).json({ error: err.message });
    });
});

// Dynamic configuration for openshift API calls
app.get('/config.js', (req, res) => {
  if (!process.env.OPENSHIFT_HOST) {
    console.warn('OPENSHIFT_HOST not set. Using service URLs from env vars');
    res.send(getMockConfigData());
  } else {
    res.send(getConfigData(req));
  }
});

app.get('/customConfig', (req, res) => {
  getCustomConfigData(configPath).then(config => {
    const compiledConfig = Mustache.render(JSON.stringify(config), req.query);
    res.json(JSON.parse(compiledConfig));
  });
});

app.get('/about', (_, res) => {
  const packageJson = require('./package.json');
  res.json({
    version: packageJson.version || 'Not Available',
    walkthroughLocations: getUniqueWalkthroughLocationInfos(walkthroughs)
  });
});

app.get('/about/walkthrough/:walkthroughId', (req, res) => {
  const { walkthroughId } = req.params;
  const walkthrough = walkthroughs.find(w => w.id === walkthroughId);
  if (!walkthrough) {
    console.error('Could not find walkthrough with ID', walkthroughId);
    res.sendStatus(404);
    return;
  }
  res.json({
    walkthroughId,
    walkthroughLocation: walkthrough.walkthroughLocationInfo
  });
});

function getUniqueWalkthroughLocationInfos(walkthroughs) {
  const infos = {};
  walkthroughs.forEach(walkthrough => {
    const { walkthroughLocationInfo } = walkthrough;
    const walkthroughLocationId = `${walkthroughLocationInfo.remote}-${walkthroughLocationInfo.directory}`;

    if (!infos[walkthroughLocationId]) {
      infos[walkthroughLocationId] = Object.assign({ walkthroughs: [] }, walkthroughLocationInfo);
    }
    infos[walkthroughLocationId].walkthroughs.push({
      id: walkthrough.id,
      title: walkthrough.title
    });
  });
  return Object.values(infos);
}

// Dynamic static path for walkthrough assets. Based on the walkthrough ID
// provided it'll look in different paths.
app.get('/walkthroughs/:walkthroughId/files/*', (req, res) => {
  const {
    params: { walkthroughId }
  } = req;
  const file = req.param(0);
  const walkthrough = walkthroughs.find(wt => wt.id === walkthroughId);
  if (!walkthrough) {
    return res.status(404).json({ error: `Walkthrough with ID ${walkthroughId} is not found` });
  }
  // Dotpaths are not allowed by default, meaning an end-user shouldn't be able
  // to abuse the file system using the wildcard file param.
  return res.sendFile(path.resolve(__dirname, `${walkthrough.basePath}`, file));
});

// Reload each walkthrough. This will clone any repo walkthroughs.
app.post('/sync-walkthroughs', (_, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.json(walkthroughs);
  }
  loadAllWalkthroughs(walkthroughLocations)
    .then(() => {
      res.json(walkthroughs);
    })
    .catch(err => {
      console.error('An error occurred when syncing walkthroughs', err);
      res.json(500, { error: 'Failed to sync walkthroughs' });
    });
});

/**
 * Load walkthroughs from the passed locations.
 * @param location (string) A string that can contains one or more walkthrough locations.
 * Locations can either be paths in the filesystem or URLs pointing to git repositories. IF
 * multiple locations are provided they must be separated by LOCATION_SEPARATOR
 */
function loadAllWalkthroughs(location) {
  let locations = [];
  if (location.indexOf(LOCATION_SEPARATOR) >= 0) {
    locations = location.split(LOCATION_SEPARATOR);
  } else {
    locations.push(location);
  }

  walkthroughs.length = 0;
  return resolveWalkthroughLocations(locations)
    .then(l => Promise.all(l.map(lookupWalkthroughResources)))
    .then(l => l.reduce((a, b) => a.concat(b)), []) // flatten walkthrough arrays of all locations
    .then(l => l.map(importWalkthroughAdoc))
    .then(l => Promise.all(l));
}

/**
 * Parses the locations provided in the env var `WALKTHROUGH_LOCATIONS` and resolves them:
 * If the location is a git repository it will be cloned and the path to the cloned repository
 * will be returned.
 * If the location is a path in the filesystem it will be returned directly.
 * @param locations An array of paths or URLs
 * @returns {Promise<any[]>}
 */
function resolveWalkthroughLocations(locations) {
  function isGitRepo(p) {
    if (!p) {
      return false;
    }
    const parsed = url.parse(p);
    return parsed.host && parsed.protocol;
  }

  function isPath(p) {
    return p && fs.existsSync(p);
  }

  const tmpDirPrefix = uuid.v4();
  const mappedLocations = locations.map(
    location =>
      new Promise((resolve, reject) => {
        const locationResultTemplate = { origin: location };
        if (!location) {
          return reject(new Error(`Invalid location ${location}`));
        } else if (isPath(location)) {
          console.log(`Importing walkthrough from path ${location}`);
          const locationResult = Object.assign(
            {
              parentId: path.basename(location),
              walkthroughLocationInfo: Object.assign({}, WALKTHROUGH_LOCATION_DEFAULT, {
                type: WALKTHROUGH_LOCATION_TYPE_PATH,
                directory: path.basename(location)
              })
            },
            locationResultTemplate,
            { local: location }
          );
          return resolve(locationResult);
        } else if (isGitRepo(location)) {
          const clonePath = path.join(TMP_DIR, tmpDirPrefix);

          // Need to parse out query params for walkthroughs, e.g custom directory
          const cloneUrl = generateCloneUrlFromLocation(location);
          const repoName = getWalkthroughRepoNameFromLocation(location);
          const walkthroughParams = querystring.parse(url.parse(location).query);

          console.log(`Importing walkthrough from git ${cloneUrl}`);
          return gitClient
            .cloneRepo(cloneUrl, clonePath)
            .then(cloned => {
              gitClient.latestLog(cloned.localDir).then(log => {
                getWalkthroughHeader(cloned.localDir)
                  .then(head => {
                    let wtHeader;
                    if (head === null) {
                      wtHeader = null;
                    } else {
                      wtHeader = head.prettyName;
                    }
                    const walkthroughFolders = [];
                    if (!Array.isArray(walkthroughParams.walkthroughsFolder)) {
                      walkthroughFolders.push(walkthroughParams.walkthroughsFolder || 'walkthroughs');
                    } else {
                      walkthroughFolders.push(...walkthroughParams.walkthroughsFolder);
                    }
                    // Get the folders to import in the repository.
                    const walkthroughInfos = walkthroughFolders.map(folder => {
                      const walkthroughLocationInfo = Object.assign({}, WALKTHROUGH_LOCATION_DEFAULT, {
                        type: WALKTHROUGH_LOCATION_TYPE_GIT,
                        commitHash: log.latest.hash,
                        commitDate: log.latest.date,
                        remote: cloned.repoName,
                        directory: folder,
                        header: wtHeader
                      });

                      return Object.assign({}, locationResultTemplate, {
                        parentId: `${repoName}-${path.basename(folder)}`,
                        walkthroughLocationInfo,
                        local: path.join(cloned.localDir, folder)
                      });
                    });
                    resolve(walkthroughInfos);
                  })
                  .catch(reject);
              });
            })
            .catch(reject);
        }

        return reject(new Error(`${location} is neither a path nor a git repo`));
      })
  );

  return Promise.all(mappedLocations).then(flattenDeep);
}

/**
 * Given a URL to a repository, strip the query and rebuild the URL
 * @param {String} location
 */
function generateCloneUrlFromLocation(location) {
  const locationParsed = url.parse(location);

  // Need to nullify query params since these are just used by us
  locationParsed.search = locationParsed.query = null;

  return url.format(locationParsed);
}

function getWalkthroughRepoNameFromLocation(location) {
  const locationParsed = url.parse(location);

  // Return the repository name, i.e the highest-level identifier
  return path.basename(locationParsed.path.split('?')[0]);
}

/**
 * Check if a walkthrough location is valid and contains `walkthrough.adoc`
 * @param location Path to the walkthrough directory
 * @returns {Promise<any>}
 */
function lookupWalkthroughResources(location) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(location.local)) {
      reject(new Error(`Could not find walkthroughs directory in provided location: ${location.origin}`));
    }
    fs.readdir(location.local, (err, files) => {
      if (err) {
        return reject(err);
      }

      const adocInfo = files.reduce((acc, dirName) => {
        const basePath = path.join(location.local, dirName);
        const adocPath = path.join(basePath, 'walkthrough.adoc');
        const jsonPath = path.join(basePath, 'walkthrough.json');

        if (!fs.existsSync(adocPath) || !fs.existsSync(jsonPath)) {
          console.log(
            `walkthrough.json and walkthrough.adoc must be included in walkthrough directory, skipping importing ${basePath}`
          );
          return acc;
        }

        acc.push({
          parentId: location.parentId,
          walkthroughLocationInfo: location.walkthroughLocationInfo,
          dirName,
          basePath,
          adocPath
        });

        return acc;
      }, []);
      return resolve(adocInfo);
    });
  });
}

/**
 * Load and process the Asciidoc of a walkthrough. Also checks if any of the walkthrough
 * IDs are duplicate and rejects them in that case.
 * @param adocContext (Object) Contains filesystem info about the walkthrough location
 * @returns {Promise<any>}
 */
function importWalkthroughAdoc(adocContext) {
  const { parentId, adocPath, dirName, basePath, walkthroughLocationInfo } = adocContext;

  return new Promise((resolve, reject) => {
    fs.readFile(adocPath, (err, rawAdoc) => {
      if (err) {
        return reject(err);
      }
      const loadedAdoc = adoc.load(rawAdoc);
      const walkthroughInfo = getWalkthroughInfoFromAdoc(parentId, dirName, basePath, loadedAdoc);
      walkthroughInfo.walkthroughLocationInfo = walkthroughLocationInfo;
      // Don't allow duplicate walkthroughs
      if (walkthroughs.find(wt => wt.id === walkthroughInfo.id)) {
        return reject(
          new Error(`Duplicate walkthrough with id ${walkthroughInfo.id} (${walkthroughInfo.shortDescription})`)
        );
      }
      walkthroughs.push(walkthroughInfo);
      return resolve();
    });
  });
}

function getCustomConfigData(configPath) {
  return new Promise(resolve => {
    if (!configPath) {
      return resolve(DEFAULT_CUSTOM_CONFIG_DATA);
    }
    fs.readFile(configPath, (err, data) => {
      if (err) {
        console.error(`Failed to read extra configuration file: ${err}`);
        return resolve(DEFAULT_CUSTOM_CONFIG_DATA);
      }
      return resolve(JSON.parse(data));
    });
  });
}

// Function to get the header of the repo-based walkthroughs
function getWalkthroughHeader(basePath) {
  const jsonPath = path.join(basePath, 'walkthroughs-config.json');
  return new Promise(resolve => {
    if (!fs.existsSync(jsonPath)) {
      console.log(`FAIL: walkthroughs-config.json is not included in the following directory: ${basePath}`);
      return resolve(null);
    }
    console.log(`SUCCESS: Found walkthroughs-config.json in the following directory: ${basePath}`);
    fs.readFile(jsonPath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Failed to read header: ${err}`);
        return resolve(null);
      }
      console.log(`getWalkthroughHeader returning: ${data}`);
      return resolve(JSON.parse(data));
    });
  });
}

function getMockConfigData() {
  return `window.OPENSHIFT_CONFIG = {
    masterUri: 'mock-openshift-console-url',
    threescaleWildcardDomain: '${process.env.THREESCALE_WILDCARD_DOMAIN || ''}',
    mockData: {
      serviceInstances: [
        {
          spec: {
            clusterServiceClassExternalName: 'amq-online-standard'
          },
          status: {
            dashboardURL:'${process.env.OPENSHIFT_URL}',
            conditions: [{ status: 'True' }]
          }
        },
        {
          spec: {
            clusterServiceClassExternalName: '3scale'
          },
          status: {
            dashboardURL:'${process.env.OPENSHIFT_URL}',
            conditions: [{ status: 'True' }]
          }
        },
        {
          spec: {
            clusterServiceClassExternalName: 'fuse'
          },
          status: {
            dashboardURL:'${process.env.OPENSHIFT_URL}',
            conditions: [{ status: 'True' }]
          }
        },
        {
          spec: {
            clusterServiceClassExternalName: 'fuse-managed'
          },
          status: {
            dashboardURL:'${process.env.OPENSHIFT_URL}',
            conditions: [{ status: 'True' }]
          }
        },
        {
          spec: {
            clusterServiceClassExternalName: 'fuse-managed'
          },
          status: {
            dashboardURL:'${process.env.OPENSHIFT_URL}',
            conditions: [{ status: 'True' }]
          }
        },
        {
          spec: {
            clusterServiceClassExternalName: 'rhsso'
          },
          status: {
            dashboardURL:'${process.env.OPENSHIFT_URL}',
            conditions: [{ status: 'True' }]
          }
        },
        {
          spec: {
            clusterServiceClassExternalName: 'launcher'
          },
          status: {
            dashboardURL:'${process.env.OPENSHIFT_URL}',
            conditions: [{ status: 'True' }]
          }
        },
        {
          spec: {
            clusterServiceClassExternalName: 'codeready'
          },
          status: {
            dashboardURL:'${process.env.OPENSHIFT_URL}',
            conditions: [{ status: 'True' }]
          }
        },
        {
          spec: {
            clusterServiceClassExternalName: 'apicurio'
          },
          status: {
            dashboardURL:'${process.env.OPENSHIFT_URL}',
            conditions: [{ status: 'True' }]
          }
        }
      ]
    }
  };`;
}

function getConfigData(req) {
  let redirectHost = null;
  if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host']) {
    redirectHost = `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`;
  } else {
    redirectHost = `https://${req.headers.host}`;
  }
  let logoutRedirectUri = null;
  if (process.env.NODE_ENV === 'production') {
    logoutRedirectUri = redirectHost;
  } else {
    logoutRedirectUri = 'http://localhost:3006';
  }

  return `window.OPENSHIFT_CONFIG = {
    clientId: '${process.env.OPENSHIFT_OAUTHCLIENT_ID}',
    accessTokenUri: 'https://${process.env.OPENSHIFT_HOST}/oauth/token',
    authorizationUri: 'https://${process.env.OPENSHIFT_HOST}/oauth/authorize',
    redirectUri: '${redirectHost}/oauth/callback',
    scopes: ['user:full'],
    masterUri: 'https://${process.env.OPENSHIFT_HOST}',
    wssMasterUri: 'wss://${process.env.OPENSHIFT_HOST}',
    ssoLogoutUri: 'https://${
    process.env.SSO_ROUTE
    }/auth/realms/openshift/protocol/openid-connect/logout?redirect_uri=${logoutRedirectUri}',
    threescaleWildcardDomain: '${process.env.THREESCALE_WILDCARD_DOMAIN || ''}'
  };`;
}

function getWalkthroughInfoFromAdoc(parentId, id, dirName, doc) {
  // Retrieve the short description. There must be a gap between the document title and the short description.
  // Otherwise it's counted as the author field. For example, see this adoc file:
  // ````
  // = This is a title
  // This is an author field
  // This would be the revision field or something
  // This is the short description.
  // ````
  // So it's better to just tell the user to put a blank line between the title and short description
  let shortDescription = '';
  if (
    doc.blocks[0] &&
    doc.blocks[0].context === 'preamble' &&
    doc.blocks[0].blocks.length > 0 &&
    doc.blocks[0].blocks[0].lines &&
    doc.blocks[0].blocks[0].lines.length > 0
  ) {
    shortDescription = doc.blocks[0].blocks[0].lines[0];
  }

  return {
    // Using the repo name plus folder name should be sufficiently unique
    id: `${parentId}-${id}`,
    title: doc.getDocumentTitle(),
    shortDescription,
    time: getTotalWalkthroughTime(doc),
    adoc: path.join(dirName, 'walkthrough.adoc'),
    json: path.join(dirName, 'walkthrough.json'),
    basePath: dirName
  };
}

const getTotalWalkthroughTime = doc => {
  let time = 0;
  doc.blocks.forEach(b => {
    if (b.context === CONTEXT_PREAMBLE || b.context === CONTEXT_PARAGRAPH) {
      return;
    }
    time += parseInt(b.getAttribute('time'), 10) || 0;
  });
  return time;
};

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'build')));
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

function run() {
  sync().then(() => {
    loadAllWalkthroughs(walkthroughLocations)
      .then(() => {
        app.listen(port, () => console.log(`Listening on port ${port}`));
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  });
}

run();
