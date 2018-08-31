const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 5001

// Dynamic configuration for openshift API calls
app.get('/config.js', (req, res) => {
  if (!process.env.OPENSHIFT_HOST) {
    console.warn('OPENSHIFT_HOST not set. Using mock data');
    res.send(`window.OPENSHIFT_CONFIG = {
      mockData: true
    };`);
  } else {
    res.send(`window.OPENSHIFT_CONFIG = {
      clientId: '${process.env.OPENSHIFT_OAUTHCLIENT_ID}',
      accessTokenUri: 'https://${process.env.OPENSHIFT_HOST}/oauth/token',
      authorizationUri: 'https://${process.env.OPENSHIFT_HOST}/oauth/authorize',
      redirectUri: '${process.env.REDIRECT_HOST}',
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
