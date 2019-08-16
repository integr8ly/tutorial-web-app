import axios from 'axios';
import serviceConfig from './config';

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
        return Promise.resolve({});
      }
      return Promise.reject(response.response.data.error);
    }
    return Promise.resolve(response);
  });

const updateThreadProgress = (username, progress) => {
  localStorage.setItem(buildUserProgressKey(username), JSON.stringify(progress));
  return Promise.resolve(progress);
};

const getThreadProgress = username => JSON.parse(localStorage.getItem(buildUserProgressKey(username)));

const buildUserProgressKey = username => `walkthroughProgress_${username}`;

export { getThread, getCustomThread, initCustomThread, updateThreadProgress, getThreadProgress };
