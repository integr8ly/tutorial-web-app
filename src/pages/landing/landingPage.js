import * as React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'patternfly-react';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import LandingPageMastHead from './landingPageMastHead';
import InstalledAppsView from '../../components/installedAppsView/InstalledAppsView';
import { connect, reduxActions } from '../../redux';

class LandingPage extends React.Component {
  componentDidMount() {
    const { listMiddleware } = this.props;
    listMiddleware();
  }

  render() {
    // TODO: Update to handle pending and error state.
    const { middleware } = this.props;
    console.log(this.props);
    if (middleware.fulfilled && middleware.apps) {
      return (
        <div>
          <LandingPageMastHead />
          <section className="app-landing-page-tutorial-dashboard-section">
            <TutorialDashboard className="app-landing-page-tutorial-dashboard-section-left" />
            <InstalledAppsView className="app-landing-page-tutorial-dashboard-section-right" apps={middleware.apps} />
          </section>
        </div>
      );
    }

    return null;
  }
}

LandingPage.propTypes = {
  listMiddleware: PropTypes.func,
  middleware: PropTypes.object
};

LandingPage.defaultProps = {
  listMiddleware: noop,
  middleware: null
};

const mapDispatchToProps = dispatch => ({
  listMiddleware: () => dispatch(reduxActions.middlewareActions.listMiddleware())
});

const mapStateToProps = state => ({ ...state.middlewareReducers });

const ConnectedLandingPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(LandingPage);

export { ConnectedLandingPage as default, LandingPage };
