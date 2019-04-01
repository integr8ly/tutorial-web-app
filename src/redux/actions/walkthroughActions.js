import { walkthroughTypes } from '../constants';
import { walkthroughServices } from '../../services';

const getWalkthrough = (language, id) => ({
  type: walkthroughTypes.GET_WALKTHROUGH,
  payload: walkthroughServices.getWalkthrough(language, id)
});

const getCustomWalkthroughs = () => ({
  type: walkthroughTypes.GET_WALKTHROUGHS,
  payload: walkthroughServices.getCustomWalkthroughs()
});

// MF 033119 - New, test on server
const getWalkthroughInfo = id => ({
  type: walkthroughTypes.GET_WALKTHROUGH_INFO,
  payload: walkthroughServices.getWalkthroughInfo(id)
});

// MF 033119 - old version, test new and delete
// const getWalkthroughInfo = () => ({
//   type: walkthroughTypes.GET_WALKTHROUGH_INFO,
//   payload: walkthroughServices.getWalkthroughInfo()
// });

export { getWalkthrough, getCustomWalkthroughs, getWalkthroughInfo };
