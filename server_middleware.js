const axios = require('axios');
const https = require('https');

const { OPENSHIFT_HOST } = process.env;

const insecureAgent = new https.Agent({
  rejectUnauthorized: false
});

exports.fetchOpenshiftUser = (req, res, next) => {
  // Not much we can do if the openshift host is not set. This probably
  // means we are running in a mock environment
  if (!OPENSHIFT_HOST) {
    return next();
  }

  const token = req.get('X-Forwarded-Access-Token');
  if (!token) {
    return res.sendStatus(403);
  }

  return axios({
    httpsAgent: insecureAgent,
    url: `https://${OPENSHIFT_HOST}/oapi/v1/users/~`,
    headers: {
      authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  })
    .then(response => {
      const {
        kind,
        metadata: { name }
      } = response.data;
      if (kind === 'User') {
        req.body.openshiftUser = name;
        return next();
      }
      return res.sendStatus(403);
    })
    .catch(err => next(err));
};
