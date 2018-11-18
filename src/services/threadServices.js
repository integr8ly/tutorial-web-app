import axios from 'axios';
import serviceConfig from './config';

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
  );

const updateThreadProgress = (username, progress) => {
  localStorage.setItem(buildUserProgressKey(username), JSON.stringify(progress));
  console.log('update', progress);
  return Promise.resolve(progress);
};

const getThreadProgress = username => JSON.parse(localStorage.getItem(buildUserProgressKey(username)));

const buildUserProgressKey = username => `walkthroughProgress_${username}`;

export { getThread, getCustomThread, initCustomThread, updateThreadProgress, getThreadProgress };
