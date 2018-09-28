import { FULFILLED_ACTION } from '../helpers';
import { GET_WALKTHROUGH_SERVICE } from '../constants/walkthroughServicesConstants';

const initialState = {
  walkthroughServices: {
    services: {}
  }
};

const walkthroughServiceReducers = (state = initialState, action) => {
  if (action.type === FULFILLED_ACTION(GET_WALKTHROUGH_SERVICE)) {
    const createData = Object.assign({}, state.walkthroughServices.services);
    createData[action.payload.spec.to.name] = action.payload;
    console.log('Create Data', createData);
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
