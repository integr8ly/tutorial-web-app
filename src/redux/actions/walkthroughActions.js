import { walkthroughTypes } from '../constants';
import { walkthroughServices } from '../../services';

const getWalkthrough = (language, id) => ({
  type: walkthroughTypes.GET_WALKTHROUGH,
  payload: walkthroughServices.getWalkthrough(language, id)
});

const getWalkthroughs = language => ({
  type: walkthroughTypes.GET_WALKTHROUGHS,
  payload: walkthroughServices.getWalkthroughs(language)
});

const getCustomWalkthroughs = () => ({
  type: walkthroughTypes.GET_WALKTHROUGHS,
  payload: walkthroughServices.getCustomWalkthroughs()
});

export { getWalkthrough, getWalkthroughs, getCustomWalkthroughs };
