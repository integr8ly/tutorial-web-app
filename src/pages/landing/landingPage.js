import * as React from 'react';
import PropTypes from 'prop-types';
import { Grid, GridItem, Page, PageSection, PageSectionVariants } from '@patternfly/react-core';
import { noop } from '../../common/helpers';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import { connect, reduxActions } from '../../redux';
import { RoutedConnectedMasthead } from '../../components/masthead/masthead';
import { currentUser } from '../../services/openshiftServices';

class LandingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUserName: null
    };
  }

  componentDidMount() {
    const { getProgress, getCustomWalkthroughs, resetCurrentWalkthrough } = this.props;
    getCustomWalkthroughs();
    resetCurrentWalkthrough();
    currentUser().then(user => {
      if (user) {
        this.setState({ currentUserName: user.fullName ? user.fullName : user.username });
        getProgress();
      }
    });
  }

  render() {
    const { walkthroughServices, user } = this.props;
    this.contentRef1 = React.createRef();
    this.contentRef2 = React.createRef();

    return (
      <Page className="pf-u-h-100vh" onLoad={this.handleLoad}>
        <RoutedConnectedMasthead currentUserName={this.state.currentUserName} />
        <PageSection variant={PageSectionVariants.light} className="pf-u-py-0 pf-u-pl-lg pf-u-pr-0">
          <h1 className="pf-c-title pf-m-4xl pf-c-landing__heading">Welcome to the Solution Explorer</h1>
          <p className="pf-c-landing__content">
            Quickly access consoles for all your Red Hat managed services, and learn how to easily implement
            integrations with Solution Pattern examples.
          </p>
        </PageSection>
        <PageSection className="pf-u-py-0 pf-u-pl-lg pf-u-pr-lg">
          <React.Fragment>
            <Grid hasGutter>
              <GridItem sm={12} md={12}>
                <TutorialDashboard userProgress={user.userProgress} walkthroughs={walkthroughServices.data} />
              </GridItem>
            </Grid>
          </React.Fragment>
        </PageSection>
      </Page>
    );
  }
}

LandingPage.propTypes = {
  getProgress: PropTypes.func,
  getCustomWalkthroughs: PropTypes.func,
  resetCurrentWalkthrough: PropTypes.func,
  walkthroughServices: PropTypes.object,
  user: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

LandingPage.defaultProps = {
  getProgress: noop,
  getCustomWalkthroughs: noop,
  resetCurrentWalkthrough: noop,
  walkthroughServices: { data: {} },
  user: { userProgress: {} },
  history: {
    push: noop
  }
};

const mapDispatchToProps = dispatch => ({
  getWalkthroughs: language => dispatch(reduxActions.walkthroughActions.getWalkthroughs(language)),
  getCustomWalkthroughs: () => dispatch(reduxActions.walkthroughActions.getCustomWalkthroughs()),
  resetCurrentWalkthrough: () => dispatch(reduxActions.threadActions.resetCustomThread()),
  getProgress: () => dispatch(reduxActions.userActions.getProgress())
});

const mapStateToProps = state => ({
  ...state.walkthroughServiceReducers,
  ...state.userReducers
});

const ConnectedLandingPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(LandingPage);

export { ConnectedLandingPage as default, LandingPage };
