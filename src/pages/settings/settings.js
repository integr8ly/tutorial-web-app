import React from 'react';
import PropTypes from 'prop-types';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
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
  TabContent,
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

  // Format the date like so: 17 June 2020; 01:00 am (05:00 UTC)
  formatMaintDate = (date, time, timezone) => {
    const dateArray = date.toDateString().split(' ');
    const timeArray = time.split(':');
    let ampm = timeArray[0] >= 12 ? 'pm' : 'am';
    const formattedDate = `${dateArray[2]} ${dateArray[1]} ${dateArray[3]}; ${time} ${ampm} (${timezone} UTC)`;

    // console.log(formattedDate);
    return formattedDate;
  };

  getTimeZone = date => {
    const timeZone = date
      .toString()
      .split(' ')[5]
      .split('GMT')[1];
    // console.log(timeZone);
    return timeZone;
  };

  getMaintenanceWindow = () => {
    const rhmiConfig = this.state.config;
    const currentDate = new Date(); // this will be replaced by don's server.js method
    const nextWeekDate = new Date();
    const timeZone = this.getTimeZone(currentDate);
    nextWeekDate.setDate(currentDate.getDate() + 7);

    const rawMaintDate = rhmiConfig.spec.maintenance.applyFrom;
    let formattedMaintDate = '';

    // console.log(`currentDate: ${currentDate}`);
    // this.getTimeZone(currentDate);

    // console.log(`next weeks date: ${nextWeekDate}`);
    // console.log(`rawMaintDate: ${rawMaintDate}`);

    const rawMaintDay = rawMaintDate.split(' ')[0];
    const rawMaintTime = rawMaintDate.split(' ')[1];
    const rawMaintHour = rawMaintTime.split(':'[0]);
    const curDay = currentDate.getDay();
    // const curTime = currentDate.getTime();
    const curHour = currentDate.getHours();

    // console.log(`rawMaintDay: ${rawMaintDate.split(' ')[0]}`);
    // console.log(`rawMaintTime: ${rawMaintDate.split(' ')[1]}`);
    // console.log(`rawMaintHour: ${rawMaintTime.split(':')[0]}`);

    // console.log(`current day: ${currentDate.getDay()}`);
    // console.log(`current time: ${currentDate.getTime()}`);
    // console.log(`current hour: ${currentDate.getHours()}`);

    const dayOfWeek = new Array(7);
    dayOfWeek[0] = 'Sun';
    dayOfWeek[1] = 'Mon';
    dayOfWeek[2] = 'Tue';
    dayOfWeek[3] = 'Wed';
    dayOfWeek[4] = 'Thu';
    dayOfWeek[5] = 'Fri';
    dayOfWeek[6] = 'Sat';

    let goodMaintDate = new Date();

    if (dayOfWeek[curDay] === rawMaintDay) {
      // console.log('maintenance day is the same day as today');
      if (curHour >= rawMaintHour) {
        // console.log('maintenance window not hit yet, keep todays date');
        // display date should be currentDate
        goodMaintDate = currentDate;
      } else {
        // console.log('maintenance window already passed for today, use next weeks date');
        goodMaintDate = nextWeekDate; // display date should be currentDate + 7
        // formattedMaintDate = nextWeekDate
      }
    } else {
      // TODO: Need to figure out the date of the next following day of the week
      // console.log('different days');
    }
    // console.log(goodMaintDate.toDateString());
    // console.log(goodMaintDate.toTimeString());
    // console.log(goodMaintDate.toString());

    // return goodMaintDate.toString();
    return this.formatMaintDate(goodMaintDate, rawMaintTime, timeZone);
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
    // console.log(rhmiConfig);

    this.contentRef1 = React.createRef();
    this.contentRef2 = React.createRef();

    // MF 061020 - disabling for testing purposes
    console.log('SECURITY IS DISABLED! Add code back to settings.js when testing is complete.');
    const isAdmin = true;
    // let isAdmin = window.localStorage.getItem('currentUserIsAdmin') === 'true';
    // // no admin protection for openshift 3 or for running demo/locally
    // if (window.OPENSHIFT_CONFIG && window.OPENSHIFT_CONFIG.openshiftVersion === 3) {
    //   isAdmin = true;
    // }


    // this.calcTime('London', '+1');

    // this.getMaintenanceWindow();

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
              <h1 id="main-content" className="pf-c-title pf-m-2xl pf-u-mt-sm pf-u-mb-xs">
                Settings
              </h1>
            </GridItem>
          </Grid>
        </PageSection>
        <PageSection variant={PageSectionVariants.light} noPadding>
          <Tabs activeKey={this.state.activeTabKey} onSelect={this.handleTabClick}>
            <Tab
              id="scheduleTab"
              eventKey={0}
              title="Managed Integration schedule"
              tabContentId="scheduleTabSection"
              tabContentRef={this.contentRef1}
            />
            <Tab
              id="solutionPatternsTab"
              eventKey={1}
              title="Solution Pattern content"
              tabContentId="solutionPatternsTabSection"
              tabContentRef={this.contentRef2}
            />
          </Tabs>
        </PageSection>
        <PageSection>
          {isAdmin ? (
            <React.Fragment>
              <TabContent eventKey={0} id="refTab1Section" ref={this.contentRef1} aria-label="Tab item 1">
                <Text className="pf-u-mt-lg">
                  The schedule for this cluster - [cluster ID] - was last updated by [user] on [date].
                </Text>
                <Card className="pf-u-w-100 pf-u-my-xl">
                  <CardHeader>
                    <h2 className="pf-c-title pf-m-lg">Daily Backups</h2>
                  </CardHeader>
                  <CardBody>
                    <Flex className="pf-m-column">
                      <FlexItem className="pf-m-spacer-sm">
                        <Text className="integr8ly__text-small--m-secondary">
                          The backup process will not impact the availability of your cluster. Backups may not be
                          scheduled during the first hour of your maintenance window.{' '}
                          <Button
                            variant="link"
                            isInline
                            component="a"
                            href="https://access.redhat.com/documentation/en-us/red_hat_managed_integration/1/html-single/getting_started/index"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Learn more
                          </Button>
                        </Text>
                      </FlexItem>
                      <FlexItem className="pf-m-spacer-md">
                        <Flex>
                          <FlexItem className="pf-m-spacer-lg">
                            <Text>Next daily backup:</Text>
                          </FlexItem>
                          <FlexItem>
                            <Text>{rhmiConfig.spec.backup.applyOn}</Text>
                            <Text>Should be in this format: 14 June 2020; 02:00 am (06:00 UTC)</Text>
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                      <FlexItem>
                        <Form>
                          <FormGroup fieldId="backup-start-time-form">
                            <Flex className="pf-m-column">
                              <Text className="pf-m-spacer-sm integr8ly__text-small">
                                <b>Start time for your backups</b>
                              </Text>
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
                            </Flex>
                          </FormGroup>
                        </Form>
                        <Text className="integr8ly__text-small--m-secondary">
                          Backups may not be scheduled during the first hour of your maintenance window.{' '}
                        </Text>
                      </FlexItem>
                      <FlexItem>
                        <Title headingLevel="h5" size="lg">
                          Maintenance window
                        </Title>
                      </FlexItem>
                      <FlexItem>
                        <Form>
                          <FormGroup fieldId="maintenance-window-form">
                            <Flex>
                              <FlexItem className="pf-m-spacer-lg">
                                <Text>Next maintenance window:</Text>
                              </FlexItem>
                              <FlexItem>
                                <Text>{this.getMaintenanceWindow()}</Text>
                              </FlexItem>
                            </Flex>
                          </FormGroup>
                        </Form>
                      </FlexItem>
                    </Flex>
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
              </TabContent>

              <TabContent
                eventKey={1}
                title="Solution Pattern content"
                tabContentId="solutionPatternsTabSection"
                id="refTab2Section"
                ref={this.contentRef2}
                aria-label="Tab item 2"
                hidden
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
                    IMPORTANT: Adding or removing Git URLs changes the list of solution patterns available to everyone
                    using the cluster. You must refresh the Home page to see the results from these changes.
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
              </TabContent>
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
