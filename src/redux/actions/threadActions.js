import { threadTypes } from '../constants';
import { threadServices } from '../../services';

const getThread = id => ({
  type: threadTypes.GET_THREAD,
  payload: threadServices.getThread(id)
});

export { getThread };
