const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 5001

// Dynamic configuration for openshift API calls
app.get('/config.js', (req, res) => {
  if (!process.env.OPENSHIFT_HOST) {
    console.warn('OPENSHIFT_HOST not set. Using service URLs from env vars');
    res.send(`window.OPENSHIFT_CONFIG = {
      mockData: {
        listProvisionedServices: [
          {
            appName: 'Red Hat Fuse Online',
            appDescription:
              'An integration Platform-as-a-Service (iPaaS) solution that makes it easy for business users to collaborate with integration experts and application developers.  Both low-code environment and developer-focused features are available in this environment.',
            appLink: '${process.env.FUSE_URL}'
          },
          {
            appName: 'Red Hat Launcher',
            appDescription: 'Continuous application delivery, built and deployed on OpenShift.',
            appLink: '${process.env.LAUNCHER_URL}'
          },
          {
            appName: 'Eclipse Che',
            appDescription: 'A developer workspace server and cloud IDE.',
            appLink: '${process.env.CHE_URL}'
          },
          {
            appName: 'EnMasse',
            appDescription: 'Managed, self-service messaging on Kubernetes.',
            appLink: '${process.env.ENMASSE_URL}'
          }
        ]
      }
    };`);
  } else {
    let redirectHost;
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host']) {
      redirectHost = `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
    } else {
      redirectHost = `https://${req.headers.host}`
    }
    res.send(`window.OPENSHIFT_CONFIG = {
      clientId: '${process.env.OPENSHIFT_OAUTHCLIENT_ID}',
      accessTokenUri: 'https://${process.env.OPENSHIFT_HOST}/oauth/token',
      authorizationUri: 'https://${process.env.OPENSHIFT_HOST}/oauth/authorize',
      redirectUri: '${redirectHost}/oauth/callback',
      scopes: ['user:full'],
      masterUri: 'https://${process.env.OPENSHIFT_HOST}'
    };`)
  }
})

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'build')))
  // Handle React routing, return all requests to React app
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
  })
}

app.listen(port, () => console.log(`Listening on port ${port}`))
