import { walkthroughTypes } from '../constants';
import { setStateProp, FULFILLED_ACTION } from '../helpers';

const initialState = {
  walkthroughs: {
    error: false,
    errorStatus: null,
    errorMessage: null,
    pending: false,
    fulfilled: false,
    data: {}
  }
};

const walkthroughReducers = (state = initialState, action) => {
  if (action.type === FULFILLED_ACTION(walkthroughTypes.CREATE_WALKTHROUGH)) {
    const createData = Object.assign({}, state.walkthroughs.data);
    createData[action.payload.spec.clusterServiceClassExternalName] = action.payload;
    return setStateProp(
      'walkthroughs',
      {
        data: createData
      },
      {
        state,
        initialState
      }
    );
  }
  if (action.type === FULFILLED_ACTION(walkthroughTypes.REMOVE_WALKTHROUGH)) {
    const removeData = Object.assign({}, state.walkthroughs.data);
    delete removeData[action.payload.spec.clusterServiceClassExternalName];
    return setStateProp(
      'walkthroughs',
      {
        data: removeData
      },
      {
        state,
        initialState
      }
    );
  }
  return state;
};

walkthroughReducers.initialState = initialState;

export { walkthroughReducers as default, walkthroughReducers, initialState };
