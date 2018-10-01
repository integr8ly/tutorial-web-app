const express = require('express')
const path = require('path')
const axios = require('axios')
const app = express()
const https = require('https')
const port = process.env.PORT || 5001
const isProduction = process.env.NODE_ENV === 'production'

async function requestHostFromKubernetes() {
  const response = await axios({
    url: 'https://kubernetes.default/.well-known/oauth-authorization-server',
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });

  if (response.status !== 200) {
    throw new Error(`received unexpected ${response.status} status when requesting openshift host URL`);
  } else if (!response.data || !response.data.issuer) {
    throw new Error('received unexpected response when requesting openshift host URL');
  } else {
    return response.data.issuer;
  }
}

async function getOpenShiftHost() {
  let { OPENSHIFT_HOST } = process.env;

  if (!OPENSHIFT_HOST) {
    console.log('OPENSHIFT_HOST environment variable not set. attempting to fetch host programmatically')

    try {
      const host = await requestHostFromKubernetes();

      // Remove http:// or https:// prefix
      OPENSHIFT_HOST = host.replace(/(^\w+:|^)\/\//, '');

      console.log('host fetched and set to %s', OPENSHIFT_HOST);
    } catch (e) {
      console.warn('Error programmatically determining OPENSHIFT_HOST:');
      console.warn(e);
    }
  }

  return OPENSHIFT_HOST;
}

// Dynamic configuration for openshift API calls
app.get('/config.js', async (req, res) => {
  const OPENSHIFT_HOST = await getOpenShiftHost();

  if (!OPENSHIFT_HOST) {
    console.warn('OPENSHIFT_HOST not set. Using service URLs from env vars');
    res.send(`window.OPENSHIFT_CONFIG = {
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
    };`);
  } else {
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

    res.send(`window.OPENSHIFT_CONFIG = {
      clientId: '${process.env.OPENSHIFT_OAUTHCLIENT_ID}',
      accessTokenUri: 'https://${OPENSHIFT_HOST}/oauth/token',
      authorizationUri: 'https://${OPENSHIFT_HOST}/oauth/authorize',
      redirectUri: '${redirectHost}/oauth/callback',
      scopes: ['user:full'],
      masterUri: 'https://${process.env.OPENSHIFT_HOST}',
      wssMasterUri: 'wss://${process.env.OPENSHIFT_HOST}',
      ssoLogoutUri: 'https://${process.env.SSO_ROUTE}/auth/realms/openshift/protocol/openid-connect/logout?redirect_uri=${logoutRedirectUri}'
    };`);
  }
});

if (isProduction) {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'build')));
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
