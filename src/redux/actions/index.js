import * as userActions from './userActions';
import * as threadActions from './threadActions';
import * as walkthroughActions from './walkthroughActions';

const actions = {
  userActions,
  threadActions,
  walkthroughActions
};

const reduxActions = { ...actions };

export { reduxActions as default, reduxActions, userActions, walkthroughActions };
