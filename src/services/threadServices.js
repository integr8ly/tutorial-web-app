import axios from 'axios';
import serviceConfig from './config';

const getThread = (language, id) =>
  axios(
    serviceConfig({
      url: `${process.env.REACT_APP_STEELTHREAD_JSON_PATH}${language}/thread-${id}.json`
    })
  );

const getCustomThread = id => {
  return axios(serviceConfig({
    url: `/walkthroughs/${id}/walkthrough.adoc`
  }));
}

export { getThread, getCustomThread };
