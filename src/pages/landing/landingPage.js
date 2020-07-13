import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertActionCloseButton,
  Grid,
  GridItem,
  Page,
  PageSection,
  PageSectionVariants,
  Tabs,
  Tab,
  TabContent
} from '@patternfly/react-core';
import { noop } from '../../common/helpers';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import InstalledAppsView from '../../components/installedAppsView/InstalledAppsView';
import { connect, reduxActions } from '../../redux';
import { RoutedConnectedMasthead } from '../../components/masthead/masthead';
import { provisionAMQOnline, provisionAMQOnlineV4 } from '../../services/amqOnlineServices';
import { currentUser } from '../../services/openshiftServices';
import { DEFAULT_SERVICES } from '../../common/serviceInstanceHelpers';
import { DISPLAY_SERVICES } from '../../services/middlewareServices';
import { getOpenshiftHost } from '../../common/docsHelpers';
import {
  getUsersSharedNamespaceName,
  getUsersSharedNamespaceDisplayName,
  isOpenShift4
} from '../../common/openshiftHelpers';

class LandingPage extends React.Component {
  constructor(props) {
    super(props);
    this.handleLoad = this.handleLoad.bind(this);
    this.state = {
      activeTabKey: 0,
      currentUserName: null,
      showInfoAlert: true
    };

    // Toggle currently active tab
    this.handleTabClick = (event, tabIndex) => {
      event.preventDefault();
      this.setState({
        activeTabKey: tabIndex
      });
    };
  }

  componentDidMount() {
    const { getProgress, getCustomWalkthroughs, resetCurrentWalkthrough } = this.props;
    window.addEventListener('load', this.handleLoad);
    getCustomWalkthroughs();
    resetCurrentWalkthrough();
    getProgress();
    currentUser().then(user => {
      if (user) {
        this.setState({ currentUserName: user.fullName ? user.fullName : user.username });
      }
    });
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

  handleLoad(event) {
    if (window.location.href.indexOf('/solution-patterns') > -1) {
      this.setState({ activeTabKey: 1 });
      document.getElementById('pf-tab-1-solutionPatternsTab').click();
    }
  }

  render() {
    const { walkthroughServices, middlewareServices, user } = this.props;
    const { showInfoAlert } = this.state;
    const launchFn = isOpenShift4() ? this.handleServiceLaunchV4.bind(this) : this.handleServiceLaunch.bind(this);
    const openshiftHost = getOpenshiftHost(middlewareServices);
    this.contentRef1 = React.createRef();
    this.contentRef2 = React.createRef();

    return (
      <Page className="pf-u-h-100vh" onLoad={this.handleLoad}>
        <RoutedConnectedMasthead currentUserName={this.state.currentUserName} />
        <PageSection variant={PageSectionVariants.light} className="pf-u-py-0 pf-u-pl-lg pf-u-pr-0">
          {showInfoAlert && (
            <Alert
              className="info-alert"
              variant="info"
              isInline
              title="Managed Integration Schedule Available"
              actionClose={<AlertActionCloseButton onClose={() => this.setState({ showInfoAlert: false })} />}
            >
              <p>
                You can now schedule your daily backups, weekly maintenance window, and Managed Integration upgrades
                from the Settings page. Review the default settings to ensure they are appropriate for your cluster.
              </p>
              <br />
              <a href="/settings">Go to settings</a>
            </Alert>
          )}
          <h1 className="pf-c-title pf-m-4xl pf-c-landing__heading">Welcome to the Solution Explorer</h1>
          <p className="pf-c-landing__content">
            Quickly access consoles for all your Red Hat managed services, and learn how to easily implement
            integrations with Solution Pattern examples.
          </p>
          <Tabs activeKey={this.state.activeTabKey} onSelect={this.handleTabClick}>
            <Tab
              id="servicesTab"
              eventKey={0}
              title="All services"
              tabContentId="servicesTabSection"
              tabContentRef={this.contentRef1}
            />
            <Tab
              id="solutionPatternsTab"
              eventKey={1}
              title="All Solution Patterns"
              tabContentId="solutionPatternsTabSection"
              tabContentRef={this.contentRef2}
            />
          </Tabs>
        </PageSection>
        <PageSection className="pf-u-py-0 pf-u-pl-lg pf-u-pr-lg">
          <React.Fragment>
            <TabContent
              className="integr8ly__tab-content"
              eventKey={0}
              id="refTab1Section"
              ref={this.contentRef1}
              aria-label="Tab item 1"
            >
              <Grid>
                <GridItem sm={12} md={12}>
                  <InstalledAppsView
                    apps={Object.values(middlewareServices.data)}
                    username={this.state.currentUserName}
                    openshiftHost={openshiftHost}
                    enableLaunch={!window.OPENSHIFT_CONFIG.mockData}
                    showUnready={middlewareServices.customServices.showUnreadyServices || DISPLAY_SERVICES}
                    customApps={middlewareServices.customServices.services}
                    handleLaunch={svcName => launchFn(svcName)}
                  />
                </GridItem>
              </Grid>
            </TabContent>

            <TabContent
              className="integr8ly__tab-content"
              eventKey={1}
              id="refTab2Section"
              ref={this.contentRef2}
              aria-label="Tab item 2"
              hidden
            >
              <Grid hasGutter>
                <GridItem sm={12} md={12}>
                  <TutorialDashboard userProgress={user.userProgress} walkthroughs={walkthroughServices.data} />
                </GridItem>
              </Grid>
            </TabContent>
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
