import React from 'react';
import configureMockStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import { ConnectedTutorialPage, TutorialPage } from '../tutorial';

const completeThread = {
  fulfilled: true,
  data: `= Example
  
  This is a sample description

  == First task
  `
};

describe('TutorialPage Component', () => {
  const generateEmptyStore = (obj = {}) => configureMockStore()(obj);
  it('should render the ConnectedTutorialPage component', () => {
    const store = generateEmptyStore({ threadReducers: { thread: { pending: true } } });
    const component = shallow(<ConnectedTutorialPage />, { context: { store } });

    expect(component).toMatchSnapshot();
  });
  it('should render the TutorialPage component pending state', () => {
    const component = shallow(<TutorialPage t={s => s} thread={{ pending: true }} />);
    expect(component).toMatchSnapshot();
  });
  it('should render the TutorialPage component error state', () => {
    const component = shallow(<TutorialPage t={s => s} thread={{ error: true }} />);
    expect(component).toMatchSnapshot();
  });
  it('should render the TutorialPage component fulfilled state', () => {
    const component = shallow(<TutorialPage t={s => s} thread={completeThread} />);
    expect(component).toMatchSnapshot();
  });
});
