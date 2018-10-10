import { userTypes } from '../constants';
import { userServices } from '../../services';
import { FULFILLED_ACTION } from '../helpers';

const checkUser = () => ({
  type: userTypes.USER_INFO,
  payload: userServices.checkUser()
});

const createUser = data => dispatch =>
  dispatch({
    type: userTypes.USER_CREATE,
    payload: userServices.createUser(data)
  });

const deleteUser = data => dispatch =>
  dispatch({
    type: userTypes.USER_DELETE,
    payload: userServices.deleteUser(data)
  });

const loginUser = data => dispatch =>
  dispatch({
    type: userTypes.USER_LOGIN,
    payload: userServices.loginUser(data)
  });

const logoutUser = () => ({
  type: userTypes.USER_LOGOUT,
  payload: userServices.logoutUser()
});

const removeStoredData = () => ({
  type: userTypes.USER_STORED_DATA_REMOVE,
  payload: userServices.removeStoredData()
});

const storeData = data => dispatch =>
  dispatch({
    type: userTypes.USER_STORED_DATA,
    payload: userServices.storeData(data)
  });

const setProgress = progress => ({
  type: FULFILLED_ACTION(userTypes.USER_SET_PROGRESS),
  payload: userServices.setProgress(progress)
});

const getProgress = () => ({
  type: FULFILLED_ACTION(userTypes.USER_GET_PROGRESS),
  payload: userServices.getProgress()
});

export {
  checkUser,
  createUser,
  deleteUser,
  getProgress,
  loginUser,
  logoutUser,
  removeStoredData,
  storeData,
  setProgress
};
