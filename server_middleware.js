const axios = require('axios');
const https = require('https');

const insecureAgent = new https.Agent({
  rejectUnauthorized: false
});

exports.fetchOpenshiftUser = (req, res, next) => {
  const token = req.get('X-Forwarded-Access-Token');
  if (!token) {
    return res.sendStatus(403);
  }

  axios({
    httpsAgent: insecureAgent,
    url: `https://${process.env.OPENSHIFT_HOST}/oapi/v1/users/~`,
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
        req.body.username = name;
        return next();
      }
      return res.sendStatus(403);
    })
    .catch(err => next(err));
};
