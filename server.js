const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 5001;

// Dynamic configuration for openshift API calls
app.get('/config.js', (req, res) => {
  if (!process.env.OPENSHIFT_HOST) {
    console.warn('OPENSHIFT_HOST not set. Using service URLs from env vars');
    res.send(`window.OPENSHIFT_CONFIG = {
      mockData: {
        listProvisionedServices: [
          {
            appName: 'Red Hat OpenShift',
            appDescription: 'An enterprise-ready container platform. Everything you build will be hosted on the same OpenShift cluster.',
            appLink: '${process.env.OPENSHIFT_URL}'
          },
          {
            appName: 'Red Hat 3scale API Management Platform',
            appDescription: 'A portal that allows you to define desired authenthication methods, set rate limits, get analytics on the user of your APIs, and create a developer portal for API consumers.',
            appLink: '${process.env.FUSE_URL}'
          },
          {
            appName: 'Red Hat AMQ',
            appDescription: 'Managed self-service messaing on Kubernetes, AMQ Online (Tech Preview) and Red Hat AMQ Broker are available in this environment.',
            appLink: '${process.env.ENMASSE_URL}'
          },
          {
            appName: 'Red Hat Fuse',
            appDescription: 'An integration platform-as-a-serviceBoth low-code environment and developer-focused features are available in this environment.',
            appLink: '${process.env.FUSE_URL}'
          },
          {
            appName: 'Red Hat OpenShift Application Runtimes',
            appDescription: 'A collection of cloud-native runtimes for developing Java &trade; or JavaScript applications on OpenShift.',
            appLink: '${process.env.LAUNCHER_URL}'
          },
          {
            appName: 'Eclipse Che',
            appDescription: 'A developer workspace server and cloud IDE.',
            appLink: '${process.env.CHE_URL}'
          }
        ]
      }
    };`);
  } else {
    let redirectHost;
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host']) {
      redirectHost = `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`;
    } else {
      redirectHost = `https://${req.headers.host}`;
    }
    res.send(`window.OPENSHIFT_CONFIG = {
      clientId: '${process.env.OPENSHIFT_OAUTHCLIENT_ID}',
      accessTokenUri: 'https://${process.env.OPENSHIFT_HOST}/oauth/token',
      authorizationUri: 'https://${process.env.OPENSHIFT_HOST}/oauth/authorize',
      redirectUri: '${redirectHost}/oauth/callback',
      scopes: ['user:full'],
      masterUri: 'https://${process.env.OPENSHIFT_HOST}'
    };`);
  }
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'build')));
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
