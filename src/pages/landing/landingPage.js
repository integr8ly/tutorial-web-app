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

    const LandingPageMastHead = () => (
      <section className="pf-c-page__main-section pf-m-dark-100 integr8ly-landing-page-masthead">
        <h1 className="pf-c-title pf-m-4xl">Welcome to the Red Hat Solution Explorer</h1>
        <p>
          Get started with an end-to-end solution walkthrough or
          <br />
          use any of the available application services to create custom integrations.
        </p>
      </section>
    );

    return (
      <React.Fragment>
        <Page>
          <PfMasthead />
          <LandingPageMastHead />
          <PageSection className="pf-u-py-0 pf-u-pl-lg pf-u-pr-0">
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
