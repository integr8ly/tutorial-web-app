import { userTypes } from '../constants';
import apiTypes from '../../constants/apiConstants';
import { setStateProp, PENDING_ACTION, REJECTED_ACTION, FULFILLED_ACTION } from '../helpers';

const initialState = {
  session: {
    error: false,
    errorMessage: '',
    pending: false,
    fulfilled: false,
    authorized: false,
    loginFailed: false,
    remember: false,
    storedEmail: null,
    username: null,
    email: null
  },
  user: {
    error: false,
    errorMessage: '',
    pending: false,
    fulfilled: false,
    userInfo: {}
  }
};

// reset initial state to avoid login for now
initialState.session.authorized = true;
initialState.session.username = 'developer';
initialState.session.email = 'developer@redhat.com';

const userReducers = (state = initialState, action) => {
  switch (action.type) {
    // Error/Rejected
    case REJECTED_ACTION(userTypes.USER_CREATE):
    case REJECTED_ACTION(userTypes.USER_DELETE):
      return setStateProp(
        'user',
        {
          error: action.error,
          errorMessage: action.payload.message
        },
        {
          state,
          initialState
        }
      );

    case REJECTED_ACTION(userTypes.USER_LOGIN):
      return setStateProp(
        'session',
        {
          error: action.error,
          errorMessage: action.payload.message,
          loginFailed: true
        },
        {
          state,
          initialState
        }
      );

    // Loading/Pending
    case PENDING_ACTION(userTypes.USER_CREATE):
    case PENDING_ACTION(userTypes.USER_DELETE):
      return setStateProp(
        'user',
        {
          pending: true
        },
        {
          state,
          initialState
        }
      );

    case PENDING_ACTION(userTypes.USER_LOGIN):
      return setStateProp(
        'session',
        {
          pending: true
        },
        {
          state,
          initialState
        }
      );

    // Success/Fulfilled
    case FULFILLED_ACTION(userTypes.USER_CREATE):
      return setStateProp(
        'user',
        {
          fulfilled: true,
          userInfo: action.payload.data
        },
        {
          state,
          initialState
        }
      );

    case FULFILLED_ACTION(userTypes.USER_DELETE):
      return setStateProp(
        'user',
        {
          fulfilled: true,
          userInfo: action.payload.data
        },
        {
          state,
          initialState
        }
      );

    case FULFILLED_ACTION(userTypes.USER_INFO): {
      const checkName = (action.payload.data && action.payload.data[apiTypes.API_RESPONSE_AUTH_USERNAME]) || null;
      const checkEmail = (action.payload.data && action.payload.data[apiTypes.API_RESPONSE_AUTH_EMAIL]) || null;
      let checkAuth = false;

      if (checkName) {
        checkAuth = true;
      }

      return setStateProp(
        'session',
        {
          authorized: checkAuth,
          username: checkName,
          email: checkEmail
        },
        {
          state,
          reset: false
        }
      );
    }

    case FULFILLED_ACTION(userTypes.USER_LOGIN):
      return setStateProp(
        'session',
        {
          fulfilled: true,
          authorized: true,
          remember: state.session.remember,
          storedEmail: state.session.storedEmail
        },
        {
          state,
          initialState
        }
      );

    case FULFILLED_ACTION(userTypes.USER_LOGOUT):
      return setStateProp(
        'session',
        {
          authorized: false,
          remember: state.session.remember,
          storedEmail: state.session.storedEmail
        },
        {
          state,
          initialState
        }
      );

    case FULFILLED_ACTION(userTypes.USER_STORED_DATA):
      return setStateProp(
        'session',
        {
          remember: true,
          storedEmail: action.payload.email
        },
        {
          state,
          initialState
        }
      );

    case FULFILLED_ACTION(userTypes.USER_STORED_DATA_REMOVE):
      return setStateProp(
        'session',
        {
          remember: false,
          storedEmail: null
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

userReducers.initialState = initialState;

export { userReducers as default, userReducers, initialState };
