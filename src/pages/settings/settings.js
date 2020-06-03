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
  Button,
  Page,
  PageSection,
  PageSectionVariants,
  SkipToContent,
  TextArea,
  Title, CardTitle, CardHeaderMain
} from '@patternfly/react-core';
import { withRouter } from 'react-router-dom';
import { noop } from '../../common/helpers';
import { RoutedConnectedMasthead } from '../../components/masthead/masthead';
import { connect, reduxActions } from '../../redux';
import Breadcrumb from '../../components/breadcrumb/breadcrumb';
import { setUserWalkthroughs, getUserWalkthroughs } from '../../services/walkthroughServices';

class SettingsPage extends React.Component {
  constructor(props) {
    super(props);

    const { userWalkthroughs } = this.props;

    this.state = {
      value: userWalkthroughs || '',
      isValid: true
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

  render() {
    const { value, isValid } = this.state;
    let isAdmin = window.localStorage.getItem('currentUserIsAdmin') === 'true';
    // no admin protection for openshift 3 or for running demo/locally
    if (window.OPENSHIFT_CONFIG && window.OPENSHIFT_CONFIG.openshiftVersion === 3) {
      isAdmin = true;
    }

    return (
      <Page className="pf-u-h-100vh">
        <SkipToContent href="#main-content">Skip to content</SkipToContent>
        <RoutedConnectedMasthead />
        <PageSection variant={PageSectionVariants.default}>
          <Breadcrumb homeClickedCallback={() => {}} threadName="Settings" />
          <Grid hasGutter>
            <GridItem mdOffset={4} md={12}>
              <h1 id="main-content" className="pf-c-title pf-m-2xl pf-u-mt-sm">
                Settings
              </h1>
              {isAdmin ? (
                <Card className="pf-u-w-50 pf-u-my-xl">
                  <CardTitle>
                    <h2 className="pf-c-title pf-m-lg">Git URL(s) for subscribed content</h2>
                  </CardTitle>
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
                        validated={(isValid) ? 'default' : 'error'}
                      >
                        <TextArea
                          validated={(isValid) ? 'default' : 'error'}
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
                  </CardFooter>
                </Card>
              ) : (
                <Card className="pf-u-w-50 pf-u-my-xl">
                  <CardBody>
                    <Bullseye>
                      <EmptyState variant={EmptyStateVariant.small}>
                        <i className="fas fa-lock pf-c-empty-state__icon" alt="" />
                        <Title headingLevel="h2" id="main-content" size="lg">
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
