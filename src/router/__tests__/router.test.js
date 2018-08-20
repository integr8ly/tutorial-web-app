import React from 'react';
import { shallow } from 'enzyme';
import Router from '../router';

describe('Router Component', () => {
  it('should render a basic component', () => {
    const component = shallow(<Router />);

    expect(component).toMatchSnapshot();
  });
});
