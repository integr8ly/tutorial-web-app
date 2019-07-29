import * as React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'patternfly-react';
import { Grid, GridItem, Page, PageSection } from '@patternfly/react-core';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import InstalledAppsView from '../../components/installedAppsView/InstalledAppsView';
import { connect, reduxActions } from '../../redux';
import { RoutedConnectedMasthead } from '../../components/masthead/masthead';
import { provisionAMQOnline } from '../../services/amqOnlineServices';
import { currentUser } from '../../services/openshiftServices';
import { DEFAULT_SERVICES } from '../../common/serviceInstanceHelpers';
import { getUsersSharedNamespaceName, getUsersSharedNamespaceDisplayName } from '../../common/openshiftHelpers';
import { DISPLAY_SERVICES } from '../../services/middlewareServices';

class LandingPage extends React.Component {
  componentDidMount() {
    const { getProgress, getCustomWalkthroughs } = this.props;
    getCustomWalkthroughs();
    getProgress();
  }

  handleServiceLaunch(svcName) {
    const { launchAMQOnline } = this.props;

    currentUser().then(user => {
      const userSharedNamespace = {
        displayName: getUsersSharedNamespaceDisplayName(user.username),
        name: getUsersSharedNamespaceName(user.username)
      };

      if (svcName === DEFAULT_SERVICES.ENMASSE) {
        launchAMQOnline(user.username, userSharedNamespace);
      }
    });
  }

  render() {
    const { walkthroughServices, middlewareServices, user } = this.props;

    return (
      <React.Fragment>
        <Page className="pf-u-h-100vh">
          <RoutedConnectedMasthead />
          <PageSection className="pf-u-py-0 pf-u-pl-lg pf-u-pr-0">
            <Grid gutter="md">
              <GridItem sm={12} md={9}>
                <TutorialDashboard userProgress={user.userProgress} walkthroughs={walkthroughServices.data} />
              </GridItem>
              <GridItem sm={12} md={3}>
                <InstalledAppsView
                  apps={Object.values(middlewareServices.data)}
                  enableLaunch={!window.OPENSHIFT_CONFIG.mockData}
                  showUnready={middlewareServices.customServices.showUnreadyServices || DISPLAY_SERVICES}
                  customApps={middlewareServices.customServices.services}
                  handleLaunch={svcName => this.handleServiceLaunch(svcName)}
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
  }),
  launchAMQOnline: PropTypes.func
};

LandingPage.defaultProps = {
  getProgress: noop,
  getCustomWalkthroughs: noop,
  middlewareServices: {
    customServices: {},
    data: {}
  },
  walkthroughServices: { data: {} },
  user: { userProgress: {} },
  history: {
    push: noop
  },
  launchAMQOnline: noop
};

const mapDispatchToProps = dispatch => ({
  getWalkthroughs: language => dispatch(reduxActions.walkthroughActions.getWalkthroughs(language)),
  getCustomWalkthroughs: () => dispatch(reduxActions.walkthroughActions.getCustomWalkthroughs()),
  getProgress: () => dispatch(reduxActions.userActions.getProgress()),
  launchAMQOnline: (username, namespace) =>
    provisionAMQOnline(dispatch, username, namespace).then(a => {
      console.log('a', a);
      return a;
    })
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
