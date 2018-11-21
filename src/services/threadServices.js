import axios from 'axios';
import serviceConfig from './config';
import { getUser } from './openshiftServices';

const initDeps = response => new Promise((resolve, reject) => {
    getUser().then(user =>
      axios({
        method: 'post',
        url: `/initThread`,
        headers: {
          'X-Forwarded-Access-Token': user.access_token
        },
        data: response.data
      })
        .then(resp => {
          if (resp.status !== 200) {
            return reject(new Error('An error occurred while initializing the dependencies'));
          }
          return resolve(response);
        })
        .catch(err => reject(err))
    );
  });

const getThread = (language, id) =>
  axios(
    serviceConfig({
      url: `${process.env.REACT_APP_STEELTHREAD_JSON_PATH}${language}/thread-${id}.json`
    })
  );

const getCustomThread = id =>
  axios(
    serviceConfig({
      url: `/walkthroughs/${id}/walkthrough.adoc`
    })
  );

const initCustomThread = id =>
  axios(
    serviceConfig({
      url: `/walkthroughs/${id}/walkthrough.json`
    }).then(response => initDeps(response))
  );

const updateThreadProgress = (username, progress) => {
  localStorage.setItem(buildUserProgressKey(username), JSON.stringify(progress));
  return Promise.resolve(progress);
};

const getThreadProgress = username => JSON.parse(localStorage.getItem(buildUserProgressKey(username)));

const buildUserProgressKey = username => `walkthroughProgress_${username}`;

export { getThread, getCustomThread, initCustomThread, updateThreadProgress, getThreadProgress };
