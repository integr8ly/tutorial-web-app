import { walkthroughServiceTypes } from '../constants';
import { FULFILLED_ACTION } from '../helpers';

const addWalkthroughService = (walkthroughId, resource) => ({
  type: FULFILLED_ACTION(walkthroughServiceTypes.ADD_RESOURCE),
  payload: { id: walkthroughId, resource }
});

const removeWalkthroughService = (walkthroughId, resource) => ({
  type: walkthroughServiceTypes.REMOVE_RESOURCE,
  payload: { id: walkthroughId, resource }
});

export { addWalkthroughService, removeWalkthroughService };
