import { threadTypes } from '../constants';
import { threadServices } from '../../services';

const getThread = (language, id) => ({
  type: threadTypes.GET_THREAD,
  payload: threadServices.getThread(language, id)
});

const getCustomThread = (id) => ({
  type: threadTypes.GET_THREAD,
  payload: threadServices.getCustomThread(id)
});

export { getThread, getCustomThread };
