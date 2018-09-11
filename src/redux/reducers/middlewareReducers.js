import { middlewareTypes } from '../constants';
import { setStateProp, PENDING_ACTION, REJECTED_ACTION, FULFILLED_ACTION } from '../helpers';

const initialState = {
  middleware: {
    error: false,
    errorStatus: null,
    errorMessage: null,
    pending: false,
    fulfilled: false,
    apps: []
  }
};

const middlewareReducers = (state = initialState, action) => {
  switch (action.type) {
    // Error/Rejected
    case REJECTED_ACTION(middlewareTypes.GET_MIDDLEWARE_SERVICES):
      return setStateProp(
        'middleware',
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
    case PENDING_ACTION(middlewareTypes.GET_MIDDLEWARE_SERVICES):
      return setStateProp(
        'middleware',
        {
          pending: true
        },
        {
          state,
          initialState
        }
      );

    // Success/Fulfilled
    case FULFILLED_ACTION(middlewareTypes.GET_MIDDLEWARE_SERVICES):
      return setStateProp(
        'middleware',
        {
          pending: false,
          fulfilled: true,
          apps: action.payload
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

middlewareReducers.initialState = initialState;

export { middlewareReducers as default, middlewareReducers, initialState };
