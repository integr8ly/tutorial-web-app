import { threadTypes } from '../constants';
import { threadServices } from '../../services';
import { PENDING_ACTION, FULFILLED_ACTION, REJECTED_ACTION } from '../helpers';

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

const initCustomThreadPending = () => ({
  type: PENDING_ACTION(threadTypes.INIT_THREAD)
});

const initCustomThreadSuccess = payload => ({
  type: FULFILLED_ACTION(threadTypes.INIT_THREAD),
  payload
});

const initCustomThreadFailure = error => ({
  type: REJECTED_ACTION(threadTypes.INIT_THREAD),
  payload: { error }
});

const updateThreadProgress = (id, progress) => ({
  type: threadTypes.UPDATE_THREAD_PROGRESS,
  payload: threadServices.updateThreadProgress(id, progress)
});

export {
  getThread,
  getCustomThread,
  initCustomThread,
  updateThreadProgress,
  initCustomThreadSuccess,
  initCustomThreadFailure,
  initCustomThreadPending
};
