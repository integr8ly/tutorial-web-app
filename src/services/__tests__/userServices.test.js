import cookies from 'js-cookie';
import moxios from 'moxios';
import { userServices } from '..';

describe('UserServices', () => {
  beforeEach(() => {
    moxios.install();
  });

  afterEach(() => {
    moxios.uninstall();
  });

  it('should have specific methods', () => {
    expect(userServices.checkUser).toBeDefined();
    expect(userServices.createUser).toBeDefined();
    expect(userServices.deleteUser).toBeDefined();
    expect(userServices.loginUser).toBeDefined();
    expect(userServices.logoutUser).toBeDefined();
  });

  it('should return promises for most methods and resolve successfully', done => {
    const promises = Object.keys(userServices).map(value => userServices[value]());

    expect(Object.keys(userServices).includes('default')).toEqual(false);

    moxios.stubRequest(/\/auth.*?/, {
      status: 200,
      responseText: { auth_token: 'test' },
      timeout: 1
    });

    Promise.all(promises).then(success => {
      expect(success).toHaveLength(Object.keys(userServices).length);
      done();
    });
  });

  it('should be rejected when login fails', done => {
    moxios.stubRequest(/\/auth.*?/, {
      status: 200,
      responseText: {},
      timeout: 1
    });

    userServices.loginUser().catch(error => {
      expect(error.toString()).toContain('User not authorized.');
      done();
    });
  });

  it('should set stored data', done => {
    const cookieValue = 'set spoof';

    userServices.storeData(cookieValue).then(success => {
      expect(btoa(JSON.stringify({ value: cookieValue }))).toEqual(cookies.get(process.env.REACT_APP_AUTH_STORED));
      expect(success).toMatchObject({ value: cookieValue });
      done();
    });
  });

  it('should extend stored data', done => {
    const cookieValue = { test: 'extend spoof' };
    const extendValue = { extend: 'more spoof' };
    cookies.set(process.env.REACT_APP_AUTH_STORED, btoa(JSON.stringify(cookieValue)));

    userServices.storeData(extendValue).then(success => {
      expect(success.test).toEqual(cookieValue.test);
      expect(success.extend).toEqual(extendValue.extend);
      done();
    });
  });

  it('should retrieve stored data', done => {
    const cookieValue = { test: 'get spoof' };
    cookies.set(process.env.REACT_APP_AUTH_STORED, btoa(JSON.stringify(cookieValue)));

    userServices.storeData().then(success => {
      expect(success).toMatchObject(cookieValue);
      done();
    });
  });
});
