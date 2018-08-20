import * as userActions from './userActions';

const actions = {
  user: userActions
};

const reduxActions = { ...actions };

export { reduxActions as default, reduxActions, userActions };
