import * as React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'patternfly-react';
import PfMasthead from '../../components/masthead/masthead';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import LandingPageMastHead from './landingPageMastHead';
import InstalledAppsView from '../../components/installedAppsView/InstalledAppsView';
import { connect } from '../../redux';
import { manageMiddlewareServices, mockMiddlewareServices } from '../../services/middlewareServices';

class LandingPage extends React.Component {
  componentDidMount() {
    const { manageWalkthroughServices, mockWalkthroughServices } = this.props;
    if (window.OPENSHIFT_CONFIG.mockData) {
      mockWalkthroughServices(window.OPENSHIFT_CONFIG.mockData);
      return;
    }
    manageWalkthroughServices();
  }

  render() {
    return (
      <div>
        <PfMasthead />
        <LandingPageMastHead />
        <section className="app-landing-page-tutorial-dashboard-section">
          <TutorialDashboard className="app-landing-page-tutorial-dashboard-section-left" />
          <InstalledAppsView
            className="app-landing-page-tutorial-dashboard-section-right"
            apps={Object.values(this.props.middlewareServices.data)}
          />
        </section>
      </div>
    );
  }
}

LandingPage.propTypes = {
  manageWalkthroughServices: PropTypes.func,
  mockWalkthroughServices: PropTypes.func,
  middlewareServices: PropTypes.object
};

LandingPage.defaultProps = {
  manageWalkthroughServices: noop,
  mockWalkthroughServices: noop,
  middlewareServices: { data: {} }
};

const mapDispatchToProps = dispatch => ({
  manageWalkthroughServices: () => manageMiddlewareServices(dispatch),
  mockWalkthroughServices: mockData => mockMiddlewareServices(dispatch, mockData)
});

const mapStateToProps = state => ({
  ...state.middlewareReducers
});

const ConnectedLandingPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(LandingPage);

export { ConnectedLandingPage as default, LandingPage };
