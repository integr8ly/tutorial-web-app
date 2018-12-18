import { shallow } from 'enzyme';
import React from 'react';
import { Breadcrumb } from '../breadcrumb';

describe('Breadcrumb component', () => {
  const props = {
    history: [],
    t: (localString, localObj) => {
      const { taskPosition, totalTasks } = localObj;
      // Verify proper localization objects are passed in.
      expect(localString).toEqual('breadcrumb.task');
      return `Task ${taskPosition} of ${totalTasks}`;
    },
    threadName: 'Unit Test Walkthrough',
    threadId: 1,
    taskPosition: 1,
    totalTasks: 3,
    homeClickedCallback: jest.fn()
  };

  test('should render default breadcrumb', () => {
    const component = shallow(<Breadcrumb />);
    const consoleOutput = jest.fn();
    global.console = { warn: consoleOutput };
    expect(component).toMatchSnapshot();
    expect(consoleOutput).toBeCalledWith(
      'Failed prop type: The prop `t` is marked as required in `Breadcrumb`, but its value is `undefined`.'
    );
  });

  test('should render breadcrumb with props', () => {
    const component = shallow(<Breadcrumb {...props} />);
    expect(component).toMatchSnapshot();
  });

  test('should handle home clicked', () => {
    const component = shallow(<Breadcrumb {...props} />);
    component.find('.integr8ly-breadcrumb-home').simulate('click');
    expect(props.homeClickedCallback.mock.calls).toHaveLength(1);
    expect(component).toMatchSnapshot();
  });
});
