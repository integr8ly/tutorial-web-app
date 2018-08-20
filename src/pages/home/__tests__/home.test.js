import React from 'react';
import { shallow } from 'enzyme';
import { HomePage } from '../home';

describe('HomePage Component', () => {
  it('should render the home page component', () => {
    const component = shallow(<HomePage t={s => s} />);

    expect(component).toMatchSnapshot();
  });
});
