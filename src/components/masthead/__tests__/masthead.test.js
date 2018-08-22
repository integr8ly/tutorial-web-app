import React from 'react';
import configureMockStore from 'redux-mock-store';
import { shallow, mount } from 'enzyme';
import { ConnectedMasthead, Masthead } from '../masthead';

describe('Masthead Component', () => {
  const generateEmptyStore = (obj = {}) => configureMockStore()(obj);

  it('should render a basic component', () => {
    const store = generateEmptyStore({ user: { session: { username: 'Admin' } } });
    const component = shallow(<ConnectedMasthead />, { context: { store } });

    expect(component).toMatchSnapshot('basic');
    expect(component.dive().find('#app-help-dropdown')).toMatchSnapshot('help dropdown');
    expect(component.dive().find('#app-user-dropdown')).toMatchSnapshot('user dropdown');
  });

  it('should render mobile navigation', () => {
    const props = {};
    const component = mount(<Masthead {...props} />);
    const componentInstance = component.instance();

    component.setState({ mobileToggle: false });
    expect(component.state().mobileToggle).toEqual(false);
    expect(component.find('div[role="menu"]')).toMatchSnapshot('mobile-nav');
    componentInstance.navToggle();
    expect(component.state().mobileToggle).toEqual(true);
  });

  it('should have specific events defined', () => {
    const component = mount(<Masthead />);
    const componentInstance = component.instance();

    expect(componentInstance.onAbout).toBeDefined();
    expect(componentInstance.onHelp).toBeDefined();
    expect(componentInstance.onLogoutUser).toBeDefined();
  });

  it('should handle basic events', () => {
    const logoutUser = jest.fn();
    const props = {
      logoutUser
    };
    const component = mount(<Masthead {...props} />);
    const componentInstance = component.instance();
    const mockEvent = { preventDefault: () => {} };

    componentInstance.onLogoutUser(mockEvent);
    expect(logoutUser).toHaveBeenCalled();
  });
});
