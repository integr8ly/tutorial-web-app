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
    const { manageWalkthroughServices, mockWalkthroughServices, getWalkthroughs } = this.props;
    getWalkthroughs('en');
    if (window.OPENSHIFT_CONFIG.mockData) {
      mockWalkthroughServices(window.OPENSHIFT_CONFIG.mockData);
      return;
    }
    manageWalkthroughServices();
  }

  render() {
    const { walkthroughServices, middlewareServices } = this.props;
    debugger;
    return (
      <div>
        <PfMasthead />
        <LandingPageMastHead />
        <section className="integr8ly-landing-page-tutorial-dashboard-section">
          <TutorialDashboard
            className="integr8ly-landing-page-tutorial-dashboard-section-left"
            walkthroughs={Object.values(walkthroughServices.data)}
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
  getWalkthroughs: PropTypes.func,
  middlewareServices: PropTypes.object,
  walkthroughServices: PropTypes.object
};

LandingPage.defaultProps = {
  manageWalkthroughServices: noop,
  mockWalkthroughServices: noop,
  getWalkthroughs: noop,
  middlewareServices: { data: {} },
  walkthroughServices: { data: {} }
};

const mapDispatchToProps = dispatch => ({
  manageWalkthroughServices: () => manageMiddlewareServices(dispatch),
  mockWalkthroughServices: mockData => mockMiddlewareServices(dispatch, mockData),
  getWalkthroughs: language => dispatch(reduxActions.walkthroughActions.getWalkthroughs(language))
});

const mapStateToProps = state => ({
  ...state.middlewareReducers,
  ...state.walkthroughServiceReducers
});

const ConnectedLandingPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(LandingPage);

export { ConnectedLandingPage as default, LandingPage };
