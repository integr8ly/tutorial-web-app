import React from 'react';
import PropTypes from 'prop-types';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Button,
  Page,
  PageSection,
  PageSectionVariants,
  SkipToContent,
  Tabs,
  Tab,
  TabContent,
  TextArea,
  Title
} from '@patternfly/react-core';
import { withRouter } from 'react-router-dom';
import { noop } from '../../common/helpers';
import { RoutedConnectedMasthead } from '../../components/masthead/masthead';
import { connect, reduxActions } from '../../redux';
import Breadcrumb from '../../components/breadcrumb/breadcrumb';
import { setUserWalkthroughs, getUserWalkthroughs } from '../../services/walkthroughServices';
import { getUser } from '../../services/openshiftServices';

const daysOfWeek = new Array(7);
daysOfWeek[0] = 'Sunday';
daysOfWeek[1] = 'Monday';
daysOfWeek[2] = 'Tuesday';
daysOfWeek[3] = 'Wednesday';
daysOfWeek[4] = 'Thursday';
daysOfWeek[5] = 'Friday';
daysOfWeek[6] = 'Saturday';

class SettingsPage extends React.Component {
  constructor(props) {
    super(props);

    const { userWalkthroughs } = this.props;

    this.state = {
      value: userWalkthroughs || '',
      isValid: true,
      activeTabKey: 0
    };

    getUserWalkthroughs().then(response => {
      if (response.data) {
        this.setState({
          value: response.data,
          isValid: true
        });
      } else {
        this.setState({
          value: '',
          isValid: true
        });
      }
    });

    // Toggle currently active tab
    this.handleTabClick = (event, tabIndex) => {
      event.preventDefault();
      this.setState({
        activeTabKey: tabIndex
      });
    };
  }

  static getDerivedStateFromProps(nextProps) {
    const config = nextProps.middlewareServices.rhmiConfig;
    if (Object.keys(config).length > 0) {
      return {
        middlewareServices: {
          rhmiConfig: config
        }
      };
    }
    return null;
  }

  exitTutorial = e => {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/`);
  };

  saveSolutionPatternSettings = (e, value) => {
    e.preventDefault();
    const { history } = this.props;
    getUser().then(({ access_token }) => {
      setUserWalkthroughs(value, access_token).then(() => {
        history.push(`/`);
      });
    });
  };

  handleTextInputChange = value => {
    this.setState(
      {
        value,
        isValid: /^(?:https:\/\/)+(www.)?github.com\/[\w\-._~:/?#[\]@!$&/'()*+,;=.]+$/.test(value)
      },
      () => {
        if (this.state.value === '') {
          this.setState({ isValid: true });
        }
        if (this.state.value.includes('\n')) {
          const repoArray = this.state.value.split('\n');

          for (let i = 0; i < repoArray.length; i++) {
            if (/^(?:https:\/\/)+(www.)?github.com\/[\w\-._~:/?#[\]@!$&/'()*+,;=.]+$/.test(repoArray[i])) {
              this.setState({
                isValid: true
              });
            } else if (repoArray[i] === '\n' || repoArray[i] === '') {
              this.setState({
                isValid: true
              });
            } else {
              this.setState({
                isValid: false
              });
            }
          }
        } else if (this.state.value === '') {
          this.setState({ isValid: true });
        } else {
          this.setState({
            isValid: /^(?:https:\/\/)+(www.)?github.com\/[\w\-._~:/?#[\]@!$&/'()*+,;=.]+$/.test(value)
          });
        }
      }
    );
  };

  render() {
    const { value, isValid } = this.state;
    this.contentRef1 = React.createRef();
    this.contentRef2 = React.createRef();

    let isAdmin = window.localStorage.getItem('currentUserIsAdmin') === 'true';

    // no admin protection for openshift 3 or for running demo/locally
    if (window.OPENSHIFT_CONFIG && window.OPENSHIFT_CONFIG.openshiftVersion === 3) {
      isAdmin = true;
    }

    // show settings alert on first render
    if (window.localStorage.getItem('showSettingsAlert') === null)
      window.localStorage.setItem('showSettingsAlert', true);

    return (
      <Page className="pf-u-h-100vh">
        <SkipToContent href="#main-content">Skip to content</SkipToContent>
        <RoutedConnectedMasthead />
        <PageSection variant={PageSectionVariants.light} className="pf-u-py-0 pf-u-pl-lg pf-u-pr-0">
          <Breadcrumb homeClickedCallback={() => {}} threadName="Settings" />
          <Grid hasGutter>
            <GridItem>
              <h1 id="main-content" className="pf-c-title pf-m-2xl pf-u-mt-lg pf-u-mb-lg">
                Settings
              </h1>
              <Tabs activeKey={this.state.activeTabKey} onSelect={this.handleTabClick}>
                <Tab
                  id="solutionPatternsTab"
                  eventKey={0}
                  title="Solution Pattern content"
                  tabContentId="solutionPatternsTabSection"
                  tabContentRef={this.contentRef2}
                />
              </Tabs>
            </GridItem>
          </Grid>
        </PageSection>
        <PageSection>
          {isAdmin ? (
            <React.Fragment>
              <TabContent
                className="integr8ly__tab-content"
                eventKey={0}
                id="refTab2Section"
                ref={this.contentRef2}
                aria-label="Tab item 2"
                hidden={false}
              >
                <PageSection className="pf-u-py-0 pf-u-pl-lg pf-u-pr-0">
                  <Grid gutter="md">
                    <GridItem sm={12} md={12} />
                  </Grid>
                </PageSection>

                <Card className="pf-u-w-100">
                  <CardTitle>
                    <h2 className="pf-c-title pf-m-lg">Manage Solution Patterns</h2>
                  </CardTitle>
                  <CardBody>
                    All of the default Managed Integration Solution Patterns are visible on the Solution Patterns tab on
                    the home page.
                  </CardBody>
                  <CardBody>
                    Add other Solution Patterns by subscribing to their Git or GitHub repositories. Put the URL for each
                    repository on a new line in the order you want the Solution Patterns to appear. You can also remove
                    repositories from the list. Any changes you make are visible to all cluster users.
                  </CardBody>
                  <CardBody>
                    <Form>
                      <FormGroup
                        label="Solution Pattern repositories"
                        type="text"
                        helperText="Example: https://github.com/integr8ly/solution-pattern-template.git"
                        helperTextInvalid="URL syntax is incorrect. Example: https://github.com/integr8ly/solution-pattern-template.git"
                        fieldId="repo-formgroup"
                        validated={isValid ? 'default' : 'error'}
                      >
                        <TextArea
                          validated={isValid ? 'default' : 'error'}
                          value={this.state.value}
                          id="repo-textfield"
                          aria-label="Add repository URLs"
                          onChange={this.handleTextInputChange}
                          className="integr8ly-settings"
                        />
                      </FormGroup>
                    </Form>
                  </CardBody>
                  <CardBody>
                    <a
                      href="https://access.redhat.com/documentation/en-us/red_hat_managed_integration/2/html-single/administering_red_hat_managed_integration_2/index#subscribing-solution-pattern-conent"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Learn more about managing Solution Pattern content
                    </a>
                  </CardBody>
                  <CardFooter>
                    <Button
                      id="solution-pattern-settings-save-button"
                      variant="primary"
                      type="button"
                      onClick={e => this.saveSolutionPatternSettings(e, value)}
                      isDisabled={!isValid}
                    >
                      Save
                    </Button>{' '}
                    <Button
                      id="settings-cancel-button"
                      variant="secondary"
                      type="button"
                      onClick={e => this.exitTutorial(e)}
                    >
                      Cancel
                    </Button>{' '}
                  </CardFooter>
                </Card>
              </TabContent>
            </React.Fragment>
          ) : (
            <Card className="pf-u-w-100">
              <CardBody>
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.small}>
                    <i className="fas fa-lock pf-c-empty-state__icon" alt="" />
                    <Title headingLevel="h2" id="main-content" size="lg">
                      Permissions needed
                    </Title>
                    <EmptyStateBody>
                      You need additional permissions to view this page or resource. Contact your administrator for more
                      information.
                    </EmptyStateBody>
                    <Button id="error-button" variant="primary" onClick={e => this.exitTutorial(e)}>
                      Go to home
                    </Button>{' '}
                  </EmptyState>
                </Bullseye>
              </CardBody>
            </Card>
          )}
        </PageSection>
      </Page>
    );
  }
}

SettingsPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }),
  userWalkthroughs: PropTypes.string,
  middlewareServices: PropTypes.object.isRequired
};

SettingsPage.defaultProps = {
  history: {
    push: noop
  },
  userWalkthroughs: ''
};

const mapDispatchToProps = dispatch => ({
  getThread: (language, id) => dispatch(reduxActions.threadActions.getThread(language, id)),
  getUserWalkthroughs: () => dispatch(reduxActions.walkthroughActions.getUserWalkthroughs())
});

const mapStateToProps = state => ({
  ...state.walkthroughServiceReducers,
  ...state.middlewareReducers
});

const ConnectedSettingsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsPage);

const RouterSettingsPage = withRouter(SettingsPage);

export { RouterSettingsPage, ConnectedSettingsPage as default, SettingsPage };
