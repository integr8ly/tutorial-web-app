import * as React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'patternfly-react';
import PfMasthead from '../../components/masthead/masthead';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import LandingPageMastHead from './landingPageMastHead';
import InstalledAppsView from '../../components/installedAppsView/InstalledAppsView';
import { connect, reduxActions } from '../../redux';
import { manageMiddlewareServices, mockMiddlewareServices } from '../../services/middlewareServices';

class LandingPage extends React.Component {
  componentDidMount() {
    const { manageWalkthroughServices, mockWalkthroughServices, getProgress, getWalkthroughs } = this.props;
    getWalkthroughs('en');
    getProgress();
    if (window.OPENSHIFT_CONFIG.mockData) {
      mockWalkthroughServices(window.OPENSHIFT_CONFIG.mockData);
      return;
    }
    manageWalkthroughServices();
  }

  render() {
    const { walkthroughServices, middlewareServices, user } = this.props;
    return (
      <div>
        <PfMasthead />
        <LandingPageMastHead />
        <section className="integr8ly-landing-page-tutorial-dashboard-section">
          <TutorialDashboard
            className="integr8ly-landing-page-tutorial-dashboard-section-left"
            userProgress={user.userProgress.threads}
            walkthroughs={walkthroughServices.data.threads}
          />
          <InstalledAppsView
            className="integr8ly-landing-page-tutorial-dashboard-section-right"
            apps={Object.values(middlewareServices.data)}
          />
        </section>
      </div>
    );
  }
}

LandingPage.propTypes = {
  manageWalkthroughServices: PropTypes.func,
  mockWalkthroughServices: PropTypes.func,
  getProgress: PropTypes.func,
  getWalkthroughs: PropTypes.func,
  middlewareServices: PropTypes.object,
  walkthroughServices: PropTypes.object,
  user: PropTypes.object
};

LandingPage.defaultProps = {
  manageWalkthroughServices: noop,
  mockWalkthroughServices: noop,
  getProgress: noop,
  getWalkthroughs: noop,
  middlewareServices: { data: {} },
  walkthroughServices: { data: {} },
  user: { userProgress: {} }
};

const mapDispatchToProps = dispatch => ({
  manageWalkthroughServices: () => manageMiddlewareServices(dispatch),
  mockWalkthroughServices: mockData => mockMiddlewareServices(dispatch, mockData),
  getWalkthroughs: language => dispatch(reduxActions.walkthroughActions.getWalkthroughs(language)),
  getProgress: () => dispatch(reduxActions.userActions.getProgress())
});

const mapStateToProps = state => ({
  ...state.middlewareReducers,
  ...state.walkthroughServiceReducers,
  ...state.userReducers
});

const ConnectedLandingPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(LandingPage);

export { ConnectedLandingPage as default, LandingPage };
