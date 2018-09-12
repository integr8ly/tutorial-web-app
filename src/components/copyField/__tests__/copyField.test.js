import React from 'react';
import { mount } from 'enzyme';
import { CopyField } from '../copyField';

describe('CopyField Component', () => {
  it('should render a single-line copy component', () => {
    const props = {
      id: 'test',
      value: JSON.stringify({ hello: 'world' })
    };
    const component = mount(<CopyField {...props} />);

    expect(component.render()).toMatchSnapshot('single-line');
  });

  it('should render a multi-line copy component', () => {
    const props = {
      id: 'test',
      multiline: true,
      value: JSON.stringify({ hello: 'world' })
    };
    const component = mount(<CopyField {...props} />);

    expect(component.render()).toMatchSnapshot('multi-line');
  });

  it('should default expanded on multiline and collapse on blur', () => {
    const props = {
      id: 'test',
      multiline: true,
      value: JSON.stringify({ hello: 'world' })
    };
    const component = mount(<CopyField {...props} />);
    const componentInstance = component.instance();
    const mockEvent = { target: { blur: () => {} } };

    componentInstance.onExpand(mockEvent);
    expect(component.state().expanded).toEqual(false);
    expect(component.render().find('textarea.integr8ly-copy-display')).toMatchSnapshot('expanded');
  });
});
