const express = require('express');
const path = require('path');
const url = require('url');
const fs = require('fs');
const asciidoctor = require('asciidoctor.js');
const adoc = asciidoctor();
const Mustache = require('mustache');
const { fetchOpenshiftUser } = require('./server_middleware');
const giteaClient = require('./gitea_client');
const gitClient = require('./git_client');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 5001;
const configPath = process.env.SERVER_EXTRA_CONFIG_FILE || '/etc/webapp/customServerConfig.json';

const DEFAULT_CUSTOM_CONFIG_DATA = {
  services: []
};

const walkthroughLocations = process.env.WALKTHROUGH_LOCATIONS || 'https://github.com/integr8ly/tutorial-web-app-walkthroughs';
const IGNORED_WALKTHROUGH_SEARCH_PATHS = ['.git', '.idea', '.DS_Store'];

const CONTEXT_PREAMBLE = 'preamble';
const CONTEXT_PARAGRAPH = 'paragraph';
const LOCATION_SEPARATOR = ',';
const TMP_DIR = process.env.TMP_DIR || '/tmp';
const TMP_DIR_PREFIX = require('uuid').v4();

const walkthroughs = [];

app.get('/customWalkthroughs', (req, res) => {
  res.status(200).json(walkthroughs);
});

// Init custom walkthroughs dependencies
app.post('/initThread', fetchOpenshiftUser, (req, res) => {
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

  const mappedLocations = locations.map(location => {
    return new Promise((resolve, reject) => {
      if (!location) {
        return reject(new Error(`Invalid location ${location}`));
      } else if (isPath(location)) {
        console.log(`Importing walkthrough from path ${location}`);
        return resolve(location);
      } else if (isGitRepo(location)) {
        console.log(`Importing walkthrough from git ${location}`);
        const clonePath = path.join(TMP_DIR, TMP_DIR_PREFIX);
        const walkthroughsPath = path.join(clonePath, 'walkthroughs');
        return gitClient.cloneRepo(location, clonePath)
          .then(() => resolve(walkthroughsPath))
          .catch(reject);
      }
      return reject(new Error(`${location} is neither a path nor a git repo`));
    });
  });

  return Promise.all(mappedLocations);
}

/**
 * Check if a walkthrough location is valid and contains `walkthrough.adoc`
 * @param location Path to the walkthrough directory
 * @returns {Promise<any>}
 */
function lookupWalkthroughResources(location) {
  return new Promise((resolve, reject) => {
    fs.readdir(location, (err, files) => {
      if (err) {
        return reject(err);
      }

      const adocInfo = files.reduce((acc, dirName) => {
        const basePath = path.join(location, dirName);
        const adocPath = path.join(basePath, 'walkthrough.adoc');
        if (fs.existsSync(adocPath)) {
          acc.push({
            dirName,
            basePath,
            adocPath
          });
        } else {
          console.log(`No walkthrough.adoc present in ${basePath}`);
        }
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
  const { adocPath, dirName, basePath } = adocContext;

  return new Promise((resolve, reject) => {
    fs.readFile(adocPath, (err, rawAdoc) => {
      if (err) {
        return reject(err);
      }
      const loadedAdoc = adoc.load(rawAdoc);
      const walkthroughInfo = getWalkthroughInfoFromAdoc(dirName, basePath, loadedAdoc);
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
  return new Promise((resolve) => {
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

function getMockConfigData() {
  return `window.OPENSHIFT_CONFIG = {
    masterUri: 'mock-openshift-console-url',
    mockData: {
      serviceInstances: [
        {
          spec: {
            clusterServiceClassExternalName: 'enmasse-standard'
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
            clusterServiceClassExternalName: 'amq-broker-71-persistence'
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
            clusterServiceClassExternalName: 'launcher'
          },
          status: {
            dashboardURL:'${process.env.OPENSHIFT_URL}',
            conditions: [{ status: 'True' }]
          }
        },
        {
          spec: {
            clusterServiceClassExternalName: 'che'
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
  };`
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
    ssoLogoutUri: 'https://${process.env.SSO_ROUTE}/auth/realms/openshift/protocol/openid-connect/logout?redirect_uri=${logoutRedirectUri}'
  };`;
}

function getWalkthroughInfoFromAdoc(id, dirName, doc) {
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
  if (doc.blocks[0] && doc.blocks[0].context === 'preamble' && doc.blocks[0].blocks.length > 0) {
    shortDescription = doc.blocks[0].blocks[0].lines[0];
  }

  return {
    id,
    title: doc.getDocumentTitle(),
    shortDescription,
    time: getTotalWalkthroughTime(doc),
    adoc: path.join(dirName, 'walkthrough.adoc'),
    json: path.join(dirName, 'walkthrough.json'),
    basePath: dirName
  };
}

const getTotalWalkthroughTime = (doc) => {
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
  loadAllWalkthroughs(walkthroughLocations)
    .then(() => {
      app.listen(port, () => console.log(`Listening on port ${port}`));
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

run();