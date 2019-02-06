import React from 'react';
import { mount } from 'enzyme';
import { AboutModal } from '../aboutModal';

describe('AboutModal Component', () => {
  it('should render a non-connected component', () => {
    const props = {
      show: false,
      userReducers: { session: { username: 'test' } }
    };

    const component = mount(<AboutModal {...props} />);
    expect(component).toMatchSnapshot('hidden modal');

    component.setState({ show: true });
    expect(component).toMatchSnapshot('show modal');
  });
});
