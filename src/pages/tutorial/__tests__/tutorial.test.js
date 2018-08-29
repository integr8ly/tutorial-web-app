import React from 'react';
import configureMockStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import { ConnectedTutorialPage, TutorialPage } from '../tutorial';

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
    const component = shallow(
      <TutorialPage
        t={s => s}
        thread={{
          fulfilled: true,
          data: {
            roles: ['Developer'],
            applications: ['OpenShift'],
            prerequisites: ['Github account'],
            tasks: [
              {
                title: 'Creating an EnMasse space',
                description:
                  'EnMasse simplifies running messaging infrastructure for your organization. You use it to provide messaging services from a Node.js app to a Spring Boot app.',
                estimatedTime: 6,
                stepDoc: 'setting-up-enmasse.adoc',
                stepDocInfo: 'complete-before-proceeding.adoc'
              }
            ]
          }
        }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
