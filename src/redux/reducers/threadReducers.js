import { threadTypes } from '../constants';
import { setStateProp, PENDING_ACTION, REJECTED_ACTION, FULFILLED_ACTION } from '../helpers';

const initialState = {
  thread: {
    error: false,
    errorStatus: null,
    errorMessage: null,
    pending: false,
    fulfilled: false,
    data: {}
  }
};

const threadReducers = (state = initialState, action) => {
  switch (action.type) {
    // Error/Rejected
    case REJECTED_ACTION(threadTypes.GET_THREAD):
      return setStateProp(
        'thread',
        {
          error: action.error,
          errorMessage: action.payload.message
        },
        {
          state,
          initialState
        }
      );

    // Loading/Pending
    case PENDING_ACTION(threadTypes.GET_THREAD):
      return setStateProp(
        'thread',
        {
          pending: true
        },
        {
          state,
          initialState
        }
      );

    // Success/Fulfilled
    case FULFILLED_ACTION(threadTypes.GET_THREAD):
      return setStateProp(
        'thread',
        {
          pending: false,
          fulfilled: true,
          data: action.payload.data
        },
        {
          state,
          initialState
        }
      );

    default:
      return state;
  }
};

threadReducers.initialState = initialState;

export { threadReducers as default, threadReducers, initialState };
