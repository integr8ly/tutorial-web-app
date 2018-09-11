import * as userActions from './userActions';
import * as threadActions from './threadActions';
import * as middlewareActions from './middlewareActions';

const actions = {
  userActions,
  threadActions,
  middlewareActions
};

const reduxActions = { ...actions };

export { reduxActions as default, reduxActions, userActions };
