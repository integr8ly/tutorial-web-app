import axios from 'axios';
import serviceConfig from './config';
import { getUser } from './openshiftServices';

const initDeps = data => {
  getUser().then(user => {
    axios({
      method: 'post',
      url: `/initThread`,
      headers: {
        'X-Forwarded-Access-Token': user.access_token
      },
      data
    });
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
  ).then(response => {
    initDeps(response.data);
    return response;
  });

export { getThread, getCustomThread, initCustomThread };
