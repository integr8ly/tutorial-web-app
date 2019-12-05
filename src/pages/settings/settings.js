import React from 'react';
import PropTypes from 'prop-types';
import {
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
  TextArea
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

    return (
      <Page className="pf-u-h-100vh">
        <SkipToContent href="#main-content">Skip to content</SkipToContent>
        <RoutedConnectedMasthead />
        <PageSection variant={PageSectionVariants.default}>
          <Breadcrumb homeClickedCallback={() => {}} threadName="Application settings" />
          <Grid gutter="md">
            <GridItem mdOffset={4} md={12}>
              <h1 id="main-content" className="pf-c-title pf-m-2xl pf-u-mt-sm">
                Application settings
              </h1>
              <Card className="pf-u-w-50 pf-u-my-xl">
                <CardHeader>
                  <h2 className="pf-c-title pf-m-lg">Git URL(s) for subscribed content</h2>
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
                </CardFooter>
              </Card>
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
