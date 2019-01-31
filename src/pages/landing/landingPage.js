import * as React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'patternfly-react';
import { Grid, GridItem, Page, PageSection } from '@patternfly/react-core';
import PfMasthead from '../../components/masthead/masthead';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import InstalledAppsView from '../../components/installedAppsView/InstalledAppsView';
import { connect, reduxActions } from '../../redux';

class LandingPage extends React.Component {
  componentDidMount() {
    const { getProgress, getCustomWalkthroughs } = this.props;
    getCustomWalkthroughs();
    getProgress();
  }

  render() {
    const { walkthroughServices, middlewareServices, user } = this.props;

    return (
      <React.Fragment>
        <Page>
          <PfMasthead />
          <PageSection className="integr8ly-landing-page-tutorial-dashboard-section pf-u-p-0">
            <Grid>
              <GridItem sm={12} md={9}>
                <TutorialDashboard userProgress={user.userProgress} walkthroughs={walkthroughServices.data} />
              </GridItem>
              <GridItem sm={12} md={3}>
                <InstalledAppsView
                  apps={Object.values(middlewareServices.data)}
                  customApps={middlewareServices.customServices}
                />
              </GridItem>
            </Grid>
          </PageSection>
        </Page>
      </React.Fragment>
    );
  }
}

LandingPage.propTypes = {
  getProgress: PropTypes.func,
  getCustomWalkthroughs: PropTypes.func,
  middlewareServices: PropTypes.object,
  walkthroughServices: PropTypes.object,
  user: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

LandingPage.defaultProps = {
  getProgress: noop,
  getCustomWalkthroughs: noop,
  middlewareServices: { data: {} },
  walkthroughServices: { data: {} },
  user: { userProgress: {} },
  history: {
    push: noop
  }
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
