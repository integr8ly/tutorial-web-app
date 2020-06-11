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
  CardHeader,
  CardBody,
  CardFooter,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Button,
  Page,
  PageSection,
  PageSectionVariants,
  SkipToContent,
  Tabs,
  Tab,
  Text,
  TextArea,
  Title
} from '@patternfly/react-core';
import { withRouter } from 'react-router-dom';
import { noop } from '../../common/helpers';
import { RoutedConnectedMasthead } from '../../components/masthead/masthead';
import { connect, reduxActions } from '../../redux';
import Breadcrumb from '../../components/breadcrumb/breadcrumb';
import { setUserWalkthroughs, getUserWalkthroughs } from '../../services/walkthroughServices';
import { getCurrentRhmiConfig, updateRhmiConfig } from '../../services/rhmiConfigServices';

class SettingsPage extends React.Component {
  constructor(props) {
    super(props);

    const { userWalkthroughs } = this.props;

    this.state = {
      value: userWalkthroughs || '',
      isValid: true,
      isOpen: false,
      activeTabKey: 0
    };

    if (window.OPENSHIFT_CONFIG && window.OPENSHIFT_CONFIG.openshiftVersion === 3) {
      this.state = {
        value: userWalkthroughs || '',
        isValid: true,
        isOpen: false,
        activeTabKey: 0,
        config: {
          apiVersion: 'integreatly.org/v1alpha1',
          kind: 'RHMIConfig',
          metadata: {
            creationTimestamp: '2020-05-18T20:45:36Z',
            generation: 1,
            name: 'rhmi-config',
            namespace: 'redhat-rhmi-operator',
            resourceVersion: '37138',
            selfLink: '/apis/integreatly.org/v1alpha1/namespaces/redhat-rhmi-operator/rhmiconfigs/rhmi-config',
            uid: 'b6063850-6598-483e-9e91-5dfde651b581'
          },
          spec: {
            backup: {
              applyOn: '03:01'
            },
            maintenance: {
              applyFrom: 'Thu 02:00'
            },
            upgrade: {
              alwaysImmediately: false,
              duringNextMaintenance: false
            }
          }
        }
      };
    } else {
      this.state = {
        value: userWalkthroughs || '',
        isValid: true,
        isOpen: false,
        activeTabKey: 0,
        config: {
          apiVersion: '',
          kind: '',
          metadata: {
            creationTimestamp: '',
            generation: '',
            name: '',
            namespace: '',
            resourceVersion: '',
            selfLink: '',
            uid: ''
          },
          spec: {
            backup: {
              applyOn: ''
            },
            maintenance: {
              applyFrom: ''
            },
            upgrade: {
              alwaysImmediately: false,
              duringNextMaintenance: false
            }
          }
        }
      };
    }

    this.onToggle = isOpen => {
      this.setState({
        isOpen
      });
    };
    this.onSelect = event => {
      this.setState({
        isOpen: !this.state.isOpen
      });
      this.onFocus();
    };
    this.onFocus = () => {
      const element = document.getElementById('toggle-id');
      element.focus();
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

  componentDidMount() {
    getCurrentRhmiConfig()
      .then(response => {
        if (response) {
          this.setState({
            config: response
          });
        }
      })
      .catch(error => console.log(`ERROR: The error is: ${error}`));
  }

  exitTutorial = e => {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/`);
  };

  saveSettings = (e, value) => {
    e.preventDefault();
    const { history } = this.props;
    setUserWalkthroughs(value);
    history.push(`/`);
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

  // getUTCOffset = time => {
  //   return time + 4;
  // }
  populateHours = utcOffset => {
    const timeArray = [];
    for (let time = 0; time < 24; time++) {
      let ampm = time > 11 ? 'pm ' : 'am ';
      let utc = (time + utcOffset) + ' UTC';
      let hour = ((time + 11) % 12) + 1;
      let hourFormatted = hour + ':00 ' + ampm + utc;

      timeArray.push(hourFormatted);
    }
    console.log(timeArray);
  };

  calcTime = (city, offset) => {
    // create Date object for current location
    const date = new Date();

    // convert to ms
    // add local time zone offset
    // get UTC time in ms
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;

    // create new Date object for different city using supplied offset
    const newDate = new Date(utc + 3600000 * offset);

    // return time as string
    console.log(`The local time in ${city} is ${newDate.toLocaleString()}`);
  };

  render() {
    const { value, isValid } = this.state;
    const rhmiConfig = this.state.config;
    console.log(rhmiConfig);

    // MF 061020 - disabling for testing purposes
    console.log('SECURITY IS DISABLED! Add code back to settings.js when testing is complete.');
    const isAdmin = true;
    // let isAdmin = window.localStorage.getItem('currentUserIsAdmin') === 'true';
    // // no admin protection for openshift 3 or for running demo/locally
    // if (window.OPENSHIFT_CONFIG && window.OPENSHIFT_CONFIG.openshiftVersion === 3) {
    //   isAdmin = true;
    // }

    this.calcTime('London', '+1');

    // this.populateHours(-4);

    // let hour = new Date().getHours(); // get the hour in 24 hour format
    // let ampm = hour > 11 ? "pm" : "am"; /// get AM or PM
    // var hour = ((d + 11) % 12 + 1); // Convert 24 hours to 12 
    // selectList.val(hour + ':00 ' + ampm); // Set the dropdowns selected value

    const dropdownItems = [
      <DropdownItem key="00-time" component="button">
        12:00 am (04:00 UTC)
      </DropdownItem>,
      <DropdownItem key="01-time" component="button">
        1:00 am (05:00 UTC)
      </DropdownItem>,
      <DropdownItem key="02-time" component="button">
        2:00 am (06:00 UTC)
      </DropdownItem>,
      <DropdownItem key="03-time" component="button">
        3:00 am (07:00 UTC)
      </DropdownItem>,
      <DropdownItem key="04-time" component="button">
        4:00 am (08:00 UTC)
      </DropdownItem>,
      <DropdownItem key="05-time" component="button">
        5:00 am (09:00 UTC)
      </DropdownItem>,
      <DropdownItem key="06-time" component="button">
        6:00 am (10:00 UTC)
      </DropdownItem>,
      <DropdownItem key="07-time" component="button">
        7:00 am (11:00 UTC)
      </DropdownItem>,
      <DropdownItem key="08-time" component="button">
        8:00 am (12:00 UTC)
      </DropdownItem>,
      <DropdownItem key="09-time" component="button">
        9:00 am (13:00 UTC)
      </DropdownItem>,
      <DropdownItem key="10-time" component="button">
        10:00 am (14:00 UTC)
      </DropdownItem>,
      <DropdownItem key="11-time" component="button">
        11:00 am (15:00 UTC)
      </DropdownItem>,
      <DropdownItem key="12-time" component="button">
        12:00 pm (16:00 UTC)
      </DropdownItem>,
      <DropdownItem key="13-time" component="button">
        1:00 pm (17:00 UTC)
      </DropdownItem>,
      <DropdownItem key="14-time" component="button">
        2:00 pm (18:00 UTC)
      </DropdownItem>,
      <DropdownItem key="15-time" component="button">
        3:00 pm (19:00 UTC)
      </DropdownItem>,
      <DropdownItem key="16-time" component="button">
        4:00 pm (20:00 UTC)
      </DropdownItem>,
      <DropdownItem key="17-time" component="button">
        5:00 pm (21:00 UTC)
      </DropdownItem>,
      <DropdownItem key="18-time" component="button">
        6:00 pm (22:00 UTC)
      </DropdownItem>,
      <DropdownItem key="19-time" component="button">
        7:00 pm (23:00 UTC)
      </DropdownItem>,
      <DropdownItem key="20-time" component="button">
        8:00 pm (00:00 UTC)
      </DropdownItem>,
      <DropdownItem key="21-time" component="button">
        9:00 pm (01:00 UTC)
      </DropdownItem>,
      <DropdownItem key="22-time" component="button">
        10:00 pm (02:00 UTC)
      </DropdownItem>,
      <DropdownItem key="23-time" component="button">
        11:00 pm (03:00 UTC)
      </DropdownItem>
    ];

    return (
      <Page className="pf-u-h-100vh">
        <SkipToContent href="#main-content">Skip to content</SkipToContent>
        <RoutedConnectedMasthead />
        <PageSection variant={PageSectionVariants.light}>
          <Breadcrumb homeClickedCallback={() => {}} threadName="Settings" />
          <Grid gutter="md">
            <GridItem>
              <h1 id="main-content" className="pf-c-title pf-m-2xl pf-u-mt-sm pf-u-mb-lg">
                Settings
              </h1>
            </GridItem>
          </Grid>
        </PageSection>
        <PageSection>
          <Grid>
            <GridItem>
              {isAdmin ? (
                <React.Fragment>
                  <Tabs activeKey={this.state.activeTabKey} onSelect={this.handleTabClick}>
                    <Tab
                      id="scheduleTab"
                      eventKey={0}
                      title="Managed Integration schedule"
                      tabContentId="scheduleTabSection"
                    >
                      <Text className="pf-u-mt-lg">
                        The schedule for this cluster - [cluster ID] - was last updated by [user] on [date].
                      </Text>
                      <Card className="pf-u-w-100 pf-u-my-xl">
                        <CardHeader>
                          <h2 className="pf-c-title pf-m-lg">Backups</h2>
                        </CardHeader>
                        <CardBody>
                          The backup process will not impact the availability of your cluster. Backups may not be
                          scheduled during the first hour of your maintenance window.{' '}
                          <a
                            href="https://access.redhat.com/documentation/en-us/red_hat_managed_integration/1/html-single/getting_started/index"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Learn more
                          </a>
                        </CardBody>
                        <CardBody>
                          <Form>
                            <FormGroup
                              // label="Start time for your backups"
                              // // type="text"
                              // // helperText="Enter one value per line. Example: https://www.github.com/integr8ly/tutorial-web-app-walkthroughs.git"
                              // // helperTextInvalid="URL syntax is incorrect. Example: https://www.github.com/integr8ly/tutorial-web-app-walkthroughs.git"
                              fieldId="backup-start-time-form"
                              // isValid={isValid}
                            >
                              <Text>Next daily backup:  {rhmiConfig.spec.backup.applyOn}</Text>
                              <Text>Should be in this format: 14 June 2020; 02:00 am (06:00 UTC)</Text>

                              <Text>Start time for your backups</Text>
                              <Dropdown
                                onSelect={this.onSelect}
                                toggle={
                                  <DropdownToggle id="toggle-id" onToggle={this.onToggle}>
                                    12:00 am (04:00 UTC)
                                  </DropdownToggle>
                                }
                                isOpen={this.state.isOpen}
                                dropdownItems={dropdownItems}
                              />
                            </FormGroup>
                          </Form>
                        </CardBody>
                        <CardHeader>
                          <h2 className="pf-c-title pf-m-lg">Maintenance window</h2>
                        </CardHeader>
                        <CardBody>
                          <Form>
                            <FormGroup
                              // label="Next maintenance window:"
                              // type="text"
                              // // helperText="Enter one value per line. Example: https://www.github.com/integr8ly/tutorial-web-app-walkthroughs.git"
                              // // helperTextInvalid="URL syntax is incorrect. Example: https://www.github.com/integr8ly/tutorial-web-app-walkthroughs.git"
                              fieldId="maintenance-window-form"
                              // isValid={isValid}
                            >
                              <Text>Next maintenance window:</Text>
                              <Text>{rhmiConfig.spec.maintenance.applyFrom}</Text>
                              <Text>Should be in this format: 17 June 2020; 01:00 am (05:00 UTC)</Text>
                            </FormGroup>
                          </Form>
                        </CardBody>
                        <CardFooter>
                          <Button
                            id="settings-save-button"
                            variant="primary"
                            type="button"
                            onClick={e => this.saveSettings(e, value)}
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
                    </Tab>
                    <Tab
                      id="solutionPatternsTab"
                      eventKey={1}
                      title="Solution Pattern content"
                      tabContentId="solutionPatternsTabSection"
                    >
                      <PageSection className="pf-u-py-0 pf-u-pl-lg pf-u-pr-0">
                        <Grid gutter="md">
                          <GridItem sm={12} md={12} />
                        </Grid>
                      </PageSection>

                      <Card className="pf-u-w-100 pf-u-my-xl">
                        <CardHeader>
                          <h2 className="pf-c-title pf-m-lg">Solution patterns and subscribed content</h2>
                        </CardHeader>
                        <CardBody>
                          To display solution patterns on the Home page, add the URLs for Git repositories here. Red Hat
                          Solution Explorer default content is already included. See{' '}
                          <a
                            href="https://access.redhat.com/documentation/en-us/red_hat_managed_integration/1/html-single/getting_started/index"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Getting Started
                          </a>{' '}
                          for information about these settings.
                        </CardBody>
                        <CardBody>
                          <Form>
                            <FormGroup
                              label="List URLs in the order you want them to appear on the Home page:"
                              type="text"
                              helperText="Enter one value per line. Example: https://www.github.com/integr8ly/tutorial-web-app-walkthroughs.git"
                              helperTextInvalid="URL syntax is incorrect. Example: https://www.github.com/integr8ly/tutorial-web-app-walkthroughs.git"
                              fieldId="repo-formgroup"
                              isValid={isValid}
                            >
                              <TextArea
                                isValid={isValid}
                                value={this.state.value}
                                id="repo-textfield"
                                aria-label="Add repository URLs"
                                onChange={this.handleTextInputChange}
                                className="integr8ly-settings"
                              />
                            </FormGroup>
                          </Form>
                        </CardBody>
                        <CardBody className="integr8ly-settings-important">
                          IMPORTANT: Adding or removing Git URLs changes the list of solution patterns available to
                          everyone using the cluster. You must refresh the Home page to see the results from these
                          changes.
                        </CardBody>
                        <CardFooter>
                          <Button
                            id="settings-save-button"
                            variant="primary"
                            type="button"
                            onClick={e => this.saveSettings(e, value)}
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
                    </Tab>
                  </Tabs>
                </React.Fragment>
              ) : (
                <Card className="pf-u-w-50 pf-u-my-xl">
                  <CardBody>
                    <Bullseye>
                      <EmptyState variant={EmptyStateVariant.small}>
                        <i className="fas fa-lock pf-c-empty-state__icon" alt="" />
                        <Title id="main-content" size="lg">
                          Permissions needed
                        </Title>
                        <EmptyStateBody>
                          You need additional permissions to view this page or resource. Contact your administrator for
                          more information.
                        </EmptyStateBody>
                        <Button id="error-button" variant="primary" onClick={e => this.exitTutorial(e)}>
                          Go to home
                        </Button>{' '}
                      </EmptyState>
                    </Bullseye>
                  </CardBody>
                </Card>
              )}
            </GridItem>
          </Grid>
        </PageSection>
      </Page>
    );
  }
}

SettingsPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }),
  userWalkthroughs: PropTypes.string
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
  ...state.walkthroughServiceReducers
});

const ConnectedSettingsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsPage);

const RouterSettingsPage = withRouter(SettingsPage);

export { RouterSettingsPage as default, ConnectedSettingsPage, SettingsPage };
