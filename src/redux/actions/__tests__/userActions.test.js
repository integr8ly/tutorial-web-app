import cookies from 'js-cookie';
import moxios from 'moxios';
import promiseMiddleware from 'redux-promise-middleware';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { userActions } from '..';
import { userReducers } from '../../reducers';

describe('UserActions', () => {
  const middleware = [promiseMiddleware()];
  const generateStore = () => createStore(combineReducers({ user: userReducers }), applyMiddleware(...middleware));

  beforeEach(() => {
    moxios.install();

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: 'success'
      });
    });
  });

  afterEach(() => {
    moxios.uninstall();
  });

  it('Should return response content for checkUser method', done => {
    const store = generateStore();
    const dispatchObj = userActions.checkUser();

    store.dispatch(dispatchObj).then(() => {
      const response = store.getState().user.session;

      expect(response.authorized).toEqual(false);
      expect(response.username).toEqual(null);
      expect(response.email).toEqual(null);
      done();
    });
  });

  it('Should return response content for createUser method', done => {
    const store = generateStore();
    const dispatcher = userActions.createUser();

    dispatcher(store.dispatch).then(() => {
      const response = store.getState().user.user;

      expect(response.userInfo).toEqual('success');
      done();
    });
  });

  it('Should return response content for deleteUser method', done => {
    const store = generateStore();
    const dispatcher = userActions.deleteUser();

    dispatcher(store.dispatch).then(() => {
      const response = store.getState().user.user;

      expect(response.userInfo).toEqual('success');
      done();
    });
  });

  it('Should return response content for loginUser method', done => {
    const store = generateStore();
    const dispatcher = userActions.loginUser();

    dispatcher(store.dispatch).catch(() => {
      const response = store.getState().user.session;

      expect(response.errorMessage).toEqual('User not authorized.');
      done();
    });
  });

  it('Should return response content for logoutUser method', done => {
    const store = generateStore();
    const dispatchObj = userActions.logoutUser();

    store.dispatch(dispatchObj).then(() => {
      const response = store.getState().user.session;

      expect(response.authorized).toEqual(false);
      done();
    });
  });

  it('Should return user email for storeData method', done => {
    const cookieValue = { email: 'get spoof' };
    cookies.set(process.env.REACT_APP_AUTH_STORED, btoa(JSON.stringify(cookieValue)));

    const store = generateStore();
    const dispatcher = userActions.storeData();

    dispatcher(store.dispatch).then(() => {
      const response = store.getState().user.session;

      expect(response.storedEmail).toEqual(cookieValue.email);
      done();
    });
  });
});
