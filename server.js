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
        serviceInstances: [
          {
            spec: {
              clusterServiceClassExternalName: 'Red Hat OpenShift'
            },
            status: {
              dashboardURL:'${process.env.OPENSHIFT_URL}',
              conditions: [{ status: 'True' }]
            }
          },
          {
            spec: {
              clusterServiceClassExternalName: 'Red Hat 3scale API Management Platform'
            },
            status: {
              dashboardURL:'${process.env.OPENSHIFT_URL}',
              conditions: [{ status: 'True' }]
            }
          },
          {
            spec: {
              clusterServiceClassExternalName: 'Red Hat AMQ'
            },
            status: {
              dashboardURL:'${process.env.OPENSHIFT_URL}',
              conditions: [{ status: 'True' }]
            }
          },
          {
            spec: {
              clusterServiceClassExternalName: 'Red Hat Fuse'
            },
            status: {
              dashboardURL:'${process.env.OPENSHIFT_URL}',
              conditions: [{ status: 'True' }]
            }
          },
          {
            spec: {
              clusterServiceClassExternalName: 'Red Hat OpenShift Application Runtimes'
            },
            status: {
              dashboardURL:'${process.env.OPENSHIFT_URL}',
              conditions: [{ status: 'True' }]
            }
          },
          {
            spec: {
              clusterServiceClassExternalName: 'Eclipse Che'
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
      masterUri: 'https://${process.env.OPENSHIFT_HOST}',
      wssMasterUri: 'wss://${process.env.OPENSHIFT_HOST}'
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
