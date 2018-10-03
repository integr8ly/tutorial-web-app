import { FULFILLED_ACTION } from '../helpers';
import { GET_WALKTHROUGH_SERVICE } from '../constants/walkthroughServicesConstants';
import { buildNamespacedServiceInstanceName } from '../../common/openshiftHelpers';

const initialState = {
  walkthroughServices: {
    services: {}
  }
};

const walkthroughServiceReducers = (state = initialState, action) => {
  if (action.type === FULFILLED_ACTION(GET_WALKTHROUGH_SERVICE)) {
    const createData = Object.assign({}, state.walkthroughServices.services);
    const siName = buildNamespacedServiceInstanceName(action.payload.prefix, action.payload.data);
    createData[siName] = action.payload.data;
    return Object.assign({}, state, {
      walkthroughServices: {
        ...state.walkthroughServices,
        services: createData
      }
    });
  }
  return state;
};

walkthroughServiceReducers.initialState = initialState;

export { walkthroughServiceReducers as default, walkthroughServiceReducers, initialState };
