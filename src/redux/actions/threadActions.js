import { threadTypes } from '../constants';
import { threadServices } from '../../services';

const getThread = (language, id) => ({
  type: threadTypes.GET_THREAD,
  payload: threadServices.getThread(language, id)
});

const getCustomThread = id => ({
  type: threadTypes.GET_THREAD,
  payload: threadServices.getCustomThread(id)
});

const initCustomThread = id => ({
  type: threadTypes.INIT_THREAD,
  payload: threadServices.initCustomThread(id)
});

const updateThreadProgress = (id, progress) => ({
  type: threadTypes.UPDATE_THREAD_PROGRESS,
  payload: threadServices.updateThreadProgress(id, progress)
});

export { getThread, getCustomThread, initCustomThread, updateThreadProgress };
