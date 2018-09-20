import { threadTypes } from '../constants';
import { threadServices } from '../../services';

const getThread = (language, id) => ({
  type: threadTypes.GET_THREAD,
  payload: threadServices.getThread(language, id)
});

export { getThread };
