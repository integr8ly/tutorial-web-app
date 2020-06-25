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

const moment = require('moment');

class SettingsPage extends React.Component {
  constructor(props) {
    super(props);

    const { userWalkthroughs } = this.props;

    this.state = {
      value: userWalkthroughs || '',
      isValid: true,
      isOpen: false,
      activeTabKey: 0,
      canSave: false,
      buStartTimeDisplay: '',
      dropDownItems: [],
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
            applyOn: '00:00'
          },
          maintenance: {
            applyFrom: 'Wed 13:00'
          },
          upgrade: {
            alwaysImmediately: false,
            duringNextMaintenance: false
          }
        }
      }
    };

    this.onBackupToggle = isOpen => {
      this.setState({
        isOpen
      });
    };

    this.onBackupSelect = event => {
      this.setState({
        isOpen: !this.state.isOpen,
        buStartTimeDisplay: event.target.innerText,
        canSave: true
      });
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
          this.setState(
            {
              config: response
            },
            () =>
              this.setState({
                dropDownItems: this.populateBackupsDropdown()
              })
          );
        }
      })
      .catch(error => console.log(`ERROR: The error is: ${error}`));
  }

  exitTutorial = e => {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/`);
  };

  saveSolutionPatternSettings = (e, value) => {
    e.preventDefault();
    const { history } = this.props;
    setUserWalkthroughs(value);
    history.push(`/`);
  };

  saveMockBackupSettings = (e, value) => {
    e.preventDefault();
    const { history } = this.props;

    value = this.convertTimeTo24Hr(value);

    this.setState({ canSave: false });

    this.setState({
      config: {
        ...this.state.config,
        spec: {
          ...this.state.config.spec,
          backup: {
            ...this.state.config.spec.backup,
            applyOn: value
          }
        }
      }
    });
    history.push(`/`);
  };

  convertTimeTo24Hr = time12h => {
    const [time, modifier] = time12h.split(' ');
    let hours = time.split(':')[0];
    const minutes = time.split(':')[1];
    let pad = '';

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'PM' || modifier === 'pm') {
      hours = parseInt(hours, 10) + 12;
    }

    if (parseInt(hours, 10) < 10 && (modifier === 'AM' || 'am')) {
      pad = '0';
    }

    return `${pad}${hours}:${minutes}`;
  };

  saveBackupSettings = (e, value) => {
    e.preventDefault();
    const { history } = this.props;

    value = this.convertTimeTo24Hr(value);

    this.setState({ canSave: false });

    this.setState(
      {
        config: {
          ...this.state.config,
          spec: {
            ...this.state.config.spec,
            backup: {
              ...this.state.config.spec.backup,
              applyOn: value
            }
          }
        }
      },
      () => updateRhmiConfig(this.state.config).then(() => history.push('/'))
    );
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

  formatDate = (configDate, rawHour, rawMin) => {
    let date = new Date();
    let dateFmt = new Date();
    let dateUtc = new Date();
    let dateUtcFmt = new Date();
    let formattedDate = '';

    date = moment(configDate).set({ hour: rawHour, minutes: rawMin, seconds: '00' });
    dateFmt = moment(date).format('D MMMM YYYY; hh:mm a');

    dateUtc = moment.utc(date);
    dateUtcFmt = moment(dateUtc).format('(D MMMM YYYY; hh:mm UTC)');

    formattedDate = `${dateFmt} ${dateUtcFmt}`;
    return formattedDate;
  };

  getDailyBackup = () => {
    const rhmiConfig = this.state.config;
    const currentDate = new Date();
    const nextDayDate = new Date();
    let goodBackupDate = new Date();
    let rawBackupTime = rhmiConfig.spec.backup.applyOn;
    const rawBackupHour = rawBackupTime.split(':')[0];
    const rawBackupMin = rawBackupTime.split(':')[1];
    const curHour = currentDate.getHours();
    let backupDate = '';

    nextDayDate.setDate(currentDate.getDate() + 1);

    rawBackupTime = `${rawBackupHour[0]}:00`;

    if (curHour < rawBackupHour) {
      // if hour has not occurred yet today, display date should be currentDate
      goodBackupDate = currentDate;
    } else {
      // otherwise, maintenance window already passed for today, use next weeks date
      goodBackupDate = nextDayDate; // display date should be currentDate + 7
    }

    backupDate = this.formatDate(goodBackupDate, rawBackupHour, rawBackupMin);

    return backupDate;
  };

  getMaintenanceWindow = () => {
    const rhmiConfig = this.state.config;
    const currentDate = new Date();
    const nextWeekDate = new Date();
    const nextMaintDate = new Date();

    nextWeekDate.setDate(currentDate.getDate() + 7);

    const rawMaintDate = rhmiConfig.spec.maintenance.applyFrom; // Sun 10:00
    const rawMaintDay = rawMaintDate.split(' ')[0]; // Sun
    const rawMaintTime = rawMaintDate.split(' ')[1]; // 10:00
    const rawMaintHour = rawMaintTime.split(':')[0]; // 10
    const rawMaintMin = rawMaintTime.split(':')[1]; // 00

    const curDay = currentDate.getDay();
    const curHour = currentDate.getHours();

    const daysOfWeek = new Array(7);
    daysOfWeek[0] = 'Sun';
    daysOfWeek[1] = 'Mon';
    daysOfWeek[2] = 'Tue';
    daysOfWeek[3] = 'Wed';
    daysOfWeek[4] = 'Thu';
    daysOfWeek[5] = 'Fri';
    daysOfWeek[6] = 'Sat';

    const today = daysOfWeek[curDay];
    const maintDay = daysOfWeek.findIndex(dayOfWeek => dayOfWeek === rawMaintDay);
    let goodMaintDate = new Date();
    let maintDate = '';

    if (today === rawMaintDay) {
      // check if maintenance day is the same day as today
      if (curHour >= rawMaintHour) {
        // if the hour has not happened yet, maintenance window is todays date
        goodMaintDate = currentDate;
      } else {
        // otherwise, maintenance window already occurred today, use next weeks date
        goodMaintDate = nextWeekDate;
      }
    }
    if (maintDay < curDay) {
      goodMaintDate.setDate(nextMaintDate.getDate() + (maintDay - curDay + 7));
    } else {
      goodMaintDate.setDate(nextMaintDate.getDate() + (maintDay - curDay));
    }

    maintDate = this.formatDate(goodMaintDate, rawMaintHour, rawMaintMin);

    return maintDate;
  };

  populateBackupsDropdown = () => {
    const rhmiConfig = this.state.config;

    const dailyBackupTime = this.getDailyBackup();
    const dailyBackupTimeArray = dailyBackupTime.split(' (');

    const backupLocalTime = dailyBackupTimeArray[0].replace(';', '').trim();
    const backupUtcTime = dailyBackupTimeArray[1]
      .replace(';', '')
      .substring(0, dailyBackupTimeArray[1].indexOf(' UTC)'))
      .trim();
    const firstTimeHoursOnly = moment(backupLocalTime).format('h:mm a');
    const firstTimeUtcHoursOnly = moment(backupUtcTime).format('h:mm a');

    const dropDownItems = [];
    let backupTime = Date();
    let utcBackupTime = Date();

    const cfgMaintDate = rhmiConfig.spec.maintenance.applyFrom;
    const cfgMaintTime = cfgMaintDate.split(' ')[1]; // 10:00
    let sameTime;

    dropDownItems.push(
      <DropdownItem key="0" component="button" isDisabled={sameTime}>
        {firstTimeHoursOnly} ({firstTimeUtcHoursOnly} UTC)
      </DropdownItem>
    );

    if (this.state.buStartTimeDisplay === '') {
      this.setState({
        buStartTimeDisplay: `${firstTimeHoursOnly} (${firstTimeUtcHoursOnly} UTC)`
      });
    }

    for (let i = 1; i < 24; i++) {
      sameTime = false;
      backupTime = moment(backupLocalTime)
        .add(i, 'hours')
        .format('h:mm a');
      utcBackupTime = moment(backupUtcTime)
        .add(i, 'hours')
        .format('h:mm a');

      if (this.convertTimeTo24Hr(backupTime) === cfgMaintTime) {
        sameTime = true;
      }

      dropDownItems.push(
        <DropdownItem key={i} component="button" isDisabled={sameTime}>
          {backupTime} ({utcBackupTime} UTC)
        </DropdownItem>
      );
    }
    return dropDownItems;
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
              <TabContent
                className="integr8ly__tab-content"
                eventKey={0}
                id="refTab1Section"
                ref={this.contentRef1}
                aria-label="Tab item 1"
              >
                {/* <Text className="pf-u-mt-lg">
                  The schedule for this cluster - [cluster ID] - was last updated by [user] on [date].
                </Text> */}
                <Card className="pf-u-w-100">
                  <CardHeader>
                    <h2 className="pf-c-title pf-m-lg">Daily Backups</h2>
                  </CardHeader>
                  <CardBody>
                    <Flex className="pf-m-column">
                      <FlexItem className="pf-m-spacer-sm">
                        <Text className="integr8ly__text-small--m-secondary">
                          The backup process will not impact the availability of your cluster.
                        </Text>
                      </FlexItem>
                      <FlexItem className="pf-m-spacer-md">
                        <Flex>
                          <FlexItem className="pf-m-spacer-lg">
                            <Text>Next daily backup:</Text>
                          </FlexItem>
                          <FlexItem>
                            <Text>{this.getDailyBackup()}</Text>
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
                                className="integr8ly__dropdown-menu"
                                onSelect={this.onBackupSelect}
                                toggle={
                                  <DropdownToggle id="toggle-id" onToggle={this.onBackupToggle}>
                                    {this.state.buStartTimeDisplay}
                                  </DropdownToggle>
                                }
                                isOpen={this.state.isOpen}
                                dropdownItems={
                                  window.OPENSHIFT_CONFIG && window.OPENSHIFT_CONFIG.openshiftVersion === 3
                                    ? this.populateBackupsDropdown()
                                    : this.state.dropDownItems
                                }
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
                          Weekly maintenance window
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
                      id="backup-settings-save-button"
                      variant="primary"
                      type="button"
                      onClick={
                        window.OPENSHIFT_CONFIG && window.OPENSHIFT_CONFIG.openshiftVersion === 3
                          ? e => this.saveMockBackupSettings(e, this.state.buStartTimeDisplay)
                          : e => this.saveBackupSettings(e, this.state.buStartTimeDisplay)
                      }
                      isDisabled={!this.state.canSave}
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
                className="integr8ly__tab-content"
                eventKey={1}
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

                <Card className="pf-u-w-100">
                  <CardHeader>
                    <h2 className="pf-c-title pf-m-lg">Manage Solution Patterns</h2>
                  </CardHeader>
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
