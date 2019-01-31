import * as React from 'react';
import { Page, PageSection } from '@patternfly/react-core';

import PropTypes from 'prop-types';
import { noop } from 'patternfly-react';
// head
// import {
//   BackgroundImage,
//   BackgroundImageSrc,
//   Grid,
//   GridItem,
//   Page,
//   PageSection,
//   PageSectionVariants
// } from '@patternfly/react-core';
// import PfMasthead from '../../components/masthead/masthead';

import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import InstalledAppsView from '../../components/installedAppsView/InstalledAppsView';
import { connect, reduxActions } from '../../redux';
import { Masthead } from '../../components/masthead/masthead';

class LandingPage extends React.Component {
  componentDidMount() {
    const { getProgress, getCustomWalkthroughs } = this.props;
    getCustomWalkthroughs();
    getProgress();
  }

  render() {
    const { walkthroughServices, middlewareServices, user } = this.props;

    // head    <<<<<<< HEAD

    // const bgImages = {
    //   [BackgroundImageSrc.xs]: '/assets/images/pfbg_576.jpg',
    //   [BackgroundImageSrc.xs2x]: '/assets/images/pfbg_576@2x.jpg',
    //   [BackgroundImageSrc.sm]: '/assets/images/pfbg_768.jpg',
    //   [BackgroundImageSrc.sm2x]: '/assets/images/pfbg_768@2x.jpg',
    //   [BackgroundImageSrc.lg]: '/assets/images/pfbg_1200.jpg',
    //   [BackgroundImageSrc.filter]: '/assets/images/background-filter.svg#image_overlay'
    // };
    // return (
    //   <React.Fragment>
    //     <BackgroundImage src={bgImages} />
    //     <Page>
    //       <PfMasthead />
    //       <PageSection
    //         variant={PageSectionVariants.dark}
    //         className="integr8ly-landing-page-tutorial-dashboard-section pf-u-p-0"
    //       >
    //         <Grid>
    //           <GridItem sm={12} md={9}>
    //             <TutorialDashboard userProgress={user.userProgress} walkthroughs={walkthroughServices.data} />
    //           </GridItem>
    //           <GridItem sm={12} md={3}>
    //             <InstalledAppsView
    //               apps={Object.values(middlewareServices.data)}
    //               customApps={middlewareServices.customServices}
    //             />
    //           </GridItem>
    //         </Grid>
    const LandingPageMastHead = () => (
      <section className="pf-c-page__main-section pf-m-dark-100">
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
          <Masthead />
          <LandingPageMastHead />
          <PageSection className="pf-u-py-0 pf-u-pl-lg pf-u-pr-0">
            <div className="integr8ly-landing-page-tutorial-dashboard-section">
              <TutorialDashboard
                className="integr8ly-landing-page-tutorial-dashboard-section-left"
                userProgress={user.userProgress}
                walkthroughs={walkthroughServices.data}
              />
              <InstalledAppsView
                className="integr8ly-landing-page-tutorial-dashboard-section-right"
                apps={Object.values(middlewareServices.data)}
                customApps={middlewareServices.customServices}
              />
            </div>
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
