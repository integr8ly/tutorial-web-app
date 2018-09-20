import { userTypes } from '../constants';
import { userServices } from '../../services';

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

export { checkUser, createUser, deleteUser, loginUser, logoutUser, removeStoredData, storeData };
