import * as userActions from './userActions';
import * as threadActions from './threadActions';

const actions = {
  userActions,
  threadActions
};

const reduxActions = { ...actions };

export { reduxActions as default, reduxActions, userActions };
