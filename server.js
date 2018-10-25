const express = require('express');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

const app = express();
const port = process.env.PORT || 5001;

const configPath = process.env.SERVER_EXTRA_CONFIG_FILE || '/etc/webapp/customServerConfig.json';

const DEFAULT_CUSTOM_CONFIG_DATA = {
  services: []
};

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
    const compiledConfig = handlebars.compile(JSON.stringify(config));
    res.json(JSON.parse(compiledConfig(req.query)));
  });
});

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
  };`
}

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'build')));
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
