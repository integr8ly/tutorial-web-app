import * as React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'patternfly-react';
import PfMasthead from '../../components/masthead/masthead';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import LandingPageMastHead from './landingPageMastHead';
import InstalledAppsView from '../../components/installedAppsView/InstalledAppsView';
import { connect, reduxActions } from '../../redux';

class LandingPage extends React.Component {
  componentDidMount() {
    const { getProgress, getWalkthroughs, getCustomWalkthroughs } = this.props;
    // getWalkthroughs('en');
    getCustomWalkthroughs();
    getProgress();
  }

  render() {
    const { walkthroughServices, middlewareServices, user } = this.props;
    return (
      <div>
        <PfMasthead />
        <LandingPageMastHead />
        <main>
          <section className="integr8ly-landing-page-tutorial-dashboard-section">
            <TutorialDashboard
              className="integr8ly-landing-page-tutorial-dashboard-section-left"
              userProgress={user.userProgress.threads}
              walkthroughs={walkthroughServices.data}
            />
            <InstalledAppsView
              className="integr8ly-landing-page-tutorial-dashboard-section-right"
              apps={Object.values(middlewareServices.data)}
              customApps={middlewareServices.customServices}
            />
          </section>
        </main>
      </div>
    );
  }
}

LandingPage.propTypes = {
  getProgress: PropTypes.func,
  getWalkthroughs: PropTypes.func,
  middlewareServices: PropTypes.object,
  walkthroughServices: PropTypes.object,
  user: PropTypes.object
};

LandingPage.defaultProps = {
  getProgress: noop,
  getWalkthroughs: noop,
  middlewareServices: { data: {} },
  walkthroughServices: { data: {} },
  user: { userProgress: {} }
};

const mapDispatchToProps = dispatch => ({
  getWalkthroughs: language => dispatch(reduxActions.walkthroughActions.getWalkthroughs(language)),
  getCustomWalkthroughs: () => dispatch(reduxActions.walkthroughActions.getCustomWalkthroughs()),
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
