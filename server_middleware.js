const axios = require('axios');
const https = require('https');

const { OPENSHIFT_HOST } = process.env;

const insecureAgent = new https.Agent({
  rejectUnauthorized: false
});


function getApiHost() {
  if (process.env.OPENSHIFT_VERSION === '4') {
    return `https://${process.env.OPENSHIFT_API}/apis/user.openshift.io/v1/users/~`;
  }
  return `https://${OPENSHIFT_HOST}/oapi/v1/users/~`;
}

function checkRoles(memberGroups, requestedGroups) {
  // If no groups were requested the request is always authorized
  if (!requestedGroups) {
    return true;
  }

  // If groups were requested but the user is not a member of any group the request is
  // always unauthorized
  if (!memberGroups) {
    return false;
  }

  // Require that at least one of the requested groups are part of the members group array
  return requestedGroups.map(group => {
    console.log(`checking against ${group}`);
    return memberGroups.indexOf(group) >= 0;
  }).reduce((acc, current) => {
    return acc || current;
  }, false);
}

exports.requireRoles = config => {
  return function(req, res, next) {
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
      url: getApiHost(),
      headers: {
        authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        const {
          kind,
          groups,
          metadata: { name }
        } = response.data;
        if (kind === 'User') {
          if (checkRoles(groups, config)) {
            console.error(`Access granted to user ${name}`);
            return next();
          }
          console.error(`Access denied to user ${name}`);
        }
        return res.sendStatus(403);
      })
      .catch(err => next(err));
  };
};
