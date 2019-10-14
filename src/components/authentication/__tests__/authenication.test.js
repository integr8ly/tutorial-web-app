import React from 'react';
import configureMockStore from 'redux-mock-store';
import { shallow, mount } from 'enzyme';
import { ConnectedAuthentication, Authentication } from '../authenication';

describe('Authentication Component', () => {
  const generateEmptyStore = (obj = {}) => configureMockStore()(obj);

  it('should render a basic component with login form', () => {
    const store = generateEmptyStore({
      userReducers: { session: { error: false, loginFailed: false, pending: false } }
    });
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
});
