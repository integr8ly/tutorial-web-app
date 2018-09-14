import * as React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'patternfly-react';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import LandingPageMastHead from './landingPageMastHead';
import InstalledAppsView from '../../components/installedAppsView/InstalledAppsView';
<<<<<<< HEAD
import { connect } from '../../redux';
import { manageUserWalkthrough, mockUserWalkthrough } from '../../services/walkthroughServices';

class LandingPage extends React.Component {
  componentDidMount() {
    const { manageWalkthroughServices, mockWalkthroughServices } = this.props;
    if (window.OPENSHIFT_CONFIG.mockData) {
      mockWalkthroughServices(window.OPENSHIFT_CONFIG.mockData);
      return;
    }
    manageWalkthroughServices();
=======
import { connect, reduxActions } from '../../redux';
import { manageUserWalkthrough } from '../../services/walkthroughServices';
import { manageUserWalkthrough, mockUserWalkthrough } from '../../services/walkthroughServices';
import store from '../../redux/store';

class LandingPage extends React.Component {
  componentDidMount() {
    const { listMiddleware } = this.props;
    listMiddleware();
    if (window.OPENSHIFT_CONFIG.mockData) {
      mockUserWalkthrough(store.dispatch, window.OPENSHIFT_CONFIG.mockData);
      return;
    }
    manageUserWalkthrough(store.dispatch);
>>>>>>> Integrate Walkthrough Service with UI
  }

  render() {
    return (
      <div>
        <LandingPageMastHead />
        <section className="app-landing-page-tutorial-dashboard-section">
          <TutorialDashboard className="app-landing-page-tutorial-dashboard-section-left" />
<<<<<<< HEAD
          <InstalledAppsView
            className="app-landing-page-tutorial-dashboard-section-right"
            apps={Object.values(this.props.walkthroughs.data)}
          />
=======
          <InstalledAppsView className="app-landing-page-tutorial-dashboard-section-right" apps={Object.values(this.props.walkthroughs.data)} />
>>>>>>> Integrate Walkthrough Service with UI
        </section>
      </div>
    );
  }
}

LandingPage.propTypes = {
  manageWalkthroughServices: PropTypes.func,
  mockWalkthroughServices: PropTypes.func,
  walkthroughs: PropTypes.object
};

LandingPage.defaultProps = {
  manageWalkthroughServices: noop,
  mockWalkthroughServices: noop,
  walkthroughs: { data: {} }
};

const mapDispatchToProps = dispatch => ({
  manageWalkthroughServices: () => manageUserWalkthrough(dispatch),
  mockWalkthroughServices: mockData => mockUserWalkthrough(dispatch, mockData)
});

const mapStateToProps = state => ({
  ...state.walkthroughReducers
});

const ConnectedLandingPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(LandingPage);

export { ConnectedLandingPage as default, LandingPage };
