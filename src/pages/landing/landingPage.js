import * as React from 'react';
import PropTypes from 'prop-types';
import { Grid, GridItem, Page, PageSection, PageSectionVariants, Tabs, Tab, TabContent } from '@patternfly/react-core';
import { noop } from '../../common/helpers';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import InstalledAppsView from '../../components/installedAppsView/InstalledAppsView';
import { connect, reduxActions } from '../../redux';
import { RoutedConnectedMasthead } from '../../components/masthead/masthead';
import { provisionAMQOnline, provisionAMQOnlineV4 } from '../../services/amqOnlineServices';
import { currentUser } from '../../services/openshiftServices';
import { DEFAULT_SERVICES } from '../../common/serviceInstanceHelpers';
import { DISPLAY_SERVICES } from '../../services/middlewareServices';
import {
  getUsersSharedNamespaceName,
  getUsersSharedNamespaceDisplayName,
  isOpenShift4
} from '../../common/openshiftHelpers';

class LandingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTabKey: 0
    };

    this.contentRef1 = React.createRef();
    this.contentRef2 = React.createRef();

    // Toggle currently active tab
    this.handleTabClick = (event, tabIndex) => {
      this.setState({
        activeTabKey: tabIndex
      });
    };
  }

  componentDidMount() {
    const { getProgress, getCustomWalkthroughs, resetCurrentWalkthrough } = this.props;
    getCustomWalkthroughs();
    resetCurrentWalkthrough();
    getProgress();
  }

  handleServiceLaunchV4(svcName) {
    const { launchAMQOnlineV4 } = this.props;

    currentUser().then(user => {
      const sharedNamespaceName = getUsersSharedNamespaceName(user.username);
      if (svcName === DEFAULT_SERVICES.ENMASSE) {
        launchAMQOnlineV4(user.username, sharedNamespaceName);
      }
    });
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
    const launchFn = isOpenShift4() ? this.handleServiceLaunchV4.bind(this) : this.handleServiceLaunch.bind(this);

    return (
      <React.Fragment>
        <Page className="pf-u-h-100vh">
          <RoutedConnectedMasthead />
          <PageSection variant={PageSectionVariants.light} className="pf-u-py-0 pf-u-pl-lg pf-u-pr-0">
            <h1 className="pf-c-title pf-m-4xl pf-c-landing__heading">Welcome to the Solution Explorer</h1>
            <p className="pf-c-landing__content">
              Quickly access consoles for all your Red Hat managed and self-managed services, and learn how to easily
              implement enterprise integrations with Solution Pattern examples.
            </p>
            <Tabs activeKey={this.state.activeTabKey} onSelect={this.handleTabClick}>
              <Tab
                eventKey={0}
                title="All services"
                tabContentId="servicesTabSection"
                tabContentRef={this.contentRef1}
              />
              <Tab
                eventKey={1}
                title="All Solution Patterns"
                tabContentId="solutionPatternsTabSection"
                tabContentRef={this.contentRef2}
              />
            </Tabs>
          </PageSection>
          <PageSection className="pf-u-py-0 pf-u-pl-lg pf-u-pr-lg">
            <div>
              <TabContent eventKey={0} id="servicesTabSection" ref={this.contentRef1} aria-label="Services tab content">
                <Grid>
                  <GridItem sm={12} md={12}>
                    <InstalledAppsView
                      apps={Object.values(middlewareServices.data)}
                      enableLaunch={!window.OPENSHIFT_CONFIG.mockData}
                      showUnready={middlewareServices.customServices.showUnreadyServices || DISPLAY_SERVICES}
                      customApps={middlewareServices.customServices.services}
                      handleLaunch={svcName => launchFn(svcName)}
                    />
                  </GridItem>
                </Grid>
              </TabContent>
              <TabContent
                eventKey={1}
                id="solutionPatternsTabSection"
                ref={this.contentRef2}
                aria-label="Solution Patterns tab content"
                hidden
              >
                <Grid gutter="md">
                  <GridItem sm={12} md={12}>
                    <TutorialDashboard userProgress={user.userProgress} walkthroughs={walkthroughServices.data} />
                  </GridItem>
                </Grid>
              </TabContent>
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
  resetCurrentWalkthrough: PropTypes.func,
  middlewareServices: PropTypes.object,
  walkthroughServices: PropTypes.object,
  user: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }),
  launchAMQOnline: PropTypes.func,
  launchAMQOnlineV4: PropTypes.func
};

LandingPage.defaultProps = {
  getProgress: noop,
  getCustomWalkthroughs: noop,
  resetCurrentWalkthrough: noop,
  middlewareServices: {
    customServices: {},
    data: {}
  },
  walkthroughServices: { data: {} },
  user: { userProgress: {} },
  history: {
    push: noop
  },
  launchAMQOnline: noop,
  launchAMQOnlineV4: noop
};

const mapDispatchToProps = dispatch => ({
  getWalkthroughs: language => dispatch(reduxActions.walkthroughActions.getWalkthroughs(language)),
  getCustomWalkthroughs: () => dispatch(reduxActions.walkthroughActions.getCustomWalkthroughs()),
  resetCurrentWalkthrough: () => dispatch(reduxActions.threadActions.resetCustomThread()),
  getProgress: () => dispatch(reduxActions.userActions.getProgress()),
  launchAMQOnline: (username, namespace) => provisionAMQOnline(dispatch, username, namespace),
  launchAMQOnlineV4: (username, namespace) => provisionAMQOnlineV4(dispatch, username, namespace)
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
