import axios from 'axios';
import serviceConfig from './config';
import { getUser } from './openshiftServices';

const initDeps = response =>
  new Promise((resolve, reject) => {
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
            const errorMsg =
              resp.response && resp.response.data && resp.response.data.error
                ? resp.response.data.error
                : 'An error occurred while initializing the dependencies';
            return reject(new Error(errorMsg));
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
  ).then(resp => ({ response: resp, id }));

const getCustomThread = id =>
  axios(
    serviceConfig({
      url: `/walkthroughs/${id}/files/walkthrough.adoc`
    })
  ).then(resp => ({ data: resp.data, id }));

const initCustomThread = id =>
  axios(
    serviceConfig({
      url: `/walkthroughs/${id}/files/walkthrough.json`
    })
  ).then(response => {
    if (response && response.response && response.response.status !== 200) {
      if (response.response.status === 404) {
        console.warn(`walkthrough.json file was not found for walkthrough ${id}`);
        return initDeps({});
      }
      return Promise.reject(response.response.data.error);
    }
    return initDeps(response);
  });

const updateThreadProgress = (username, progress) => {
  localStorage.setItem(buildUserProgressKey(username), JSON.stringify(progress));
  return Promise.resolve(progress);
};

const getThreadProgress = username => JSON.parse(localStorage.getItem(buildUserProgressKey(username)));

const buildUserProgressKey = username => `walkthroughProgress_${username}`;

export { getThread, getCustomThread, initCustomThread, updateThreadProgress, getThreadProgress };
