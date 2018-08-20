import React from 'react';
import configureMockStore from 'redux-mock-store';
import { shallow, mount } from 'enzyme';
import { ConnectedAuthentication, Authentication } from '../authenication';

describe('Authentication Component', () => {
  const generateEmptyStore = (obj = {}) => configureMockStore()(obj);

  it('should render a basic component with login form', () => {
    const store = generateEmptyStore({ user: { session: { error: false, loginFailed: false, pending: false } } });
    const component = shallow(
      <ConnectedAuthentication>
        <span className="test">lorem</span>
      </ConnectedAuthentication>,
      { context: { store } }
    );

    expect(component).toMatchSnapshot('connected');
  });

  it('should render a basic component without login form', () => {
    const props = {
      session: {
        authorized: true
      }
    };

    const component = mount(
      <Authentication {...props}>
        <span className="test">lorem</span>
      </Authentication>
    );

    expect(component.render()).toMatchSnapshot('post-authorization');
  });

  it('should have specific events defined', () => {
    const checkUser = jest.fn();
    const props = {
      checkUser
    };
    const component = mount(
      <Authentication {...props}>
        <span className="test">lorem</span>
      </Authentication>
    );
    const componentInstance = component.instance();

    expect(componentInstance.onChangeEmail).toBeDefined();
    expect(componentInstance.onChangePassword).toBeDefined();
    expect(componentInstance.onChangeRemember).toBeDefined();
    expect(componentInstance.onLogin).toBeDefined();

    expect(checkUser).toHaveBeenCalled();

    component.find('input[name="email"]').simulate('change', { target: { value: '' } });
    component.find('input[name="password"]').simulate('change', { target: { value: '123' } });
    component.find('input[name="remember"]').simulate('change', { target: { checked: true } });
    expect(componentInstance.state).toMatchSnapshot('expected state');
  });
});
