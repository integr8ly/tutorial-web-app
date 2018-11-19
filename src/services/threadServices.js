import axios from 'axios';
import serviceConfig from './config';
import { getUser } from './openshiftServices';

const initDeps = response => {
  return new Promise((resolve, reject) => {
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
};

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
    })
  ).then(response => initDeps(response));

export { getThread, getCustomThread, initCustomThread };
