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
  TextArea
} from '@patternfly/react-core';
import { withRouter } from 'react-router-dom';
import { noop } from 'patternfly-react';
import RoutedConnectedMasthead from '../../components/masthead/masthead';
import { connect, reduxActions } from '../../redux';
import Breadcrumb from '../../components/breadcrumb/breadcrumb';
import { setUserWalkthroughs, getUserWalkthroughs } from '../../services/walkthroughServices';

class SettingsPage extends React.Component {
  constructor(props) {
    super(props);

    const { userWalkthroughs } = this.props;

    this.state = {
      value: userWalkthroughs || 'default load',
      isValid: true
    };

    getUserWalkthroughs().then(response => {
      if (response.data) {
        this.setState({
          value: response.data,
          isValid: true
        });
        // console.log(response);
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
        isValid: /^(?:https:\/\/)+([w.-]+)+github.com\/[\w\-._~:/?#[\]@!$&/'()*+,;=.]+$/.test(value)
      },
      () => {
        // console.log('Changed!');
        // console.log(`this.state.value: ${this.state.value}`);

        if (this.state.value === '') {
          this.setState({ isValid: true });
        }

        if (this.state.value.includes('\n')) {
          const repoArray = this.state.value.split('\n');
          // console.log(`repoArray: ${repoArray}`);

          for (let i = 0; i < repoArray.length; i++) {
            // console.log(`repoArray${i}: ${repoArray[i]}`);
            if (/^(?:https:\/\/)+([w.-]+)+github.com\/[\w\-._~:/?#[\]@!$&/'()*+,;=.]+$/.test(repoArray[i])) {
              // console.log(`${[i]}: passed regex test!`);
              this.setState({
                isValid: true
              });
            } else if (repoArray[i] === '\n' || repoArray[i] === '') {
              // console.log(`${[i]}: contains only a new line`);
              this.setState({
                isValid: true
              });
            } else {
              // console.log(`${[i]}: failed regex test!`);
              this.setState({
                isValid: false
              });
            }
          }
        } else if (this.state.value === '') {
          this.setState({ isValid: true });
        } else {
          this.setState({
            isValid: /^(?:https:\/\/)+([w.-]+)+github.com\/[\w\-._~:/?#[\]@!$&/'()*+,;=.]+$/.test(value)
          });
        }
      }
    );
    // console.log(`value: ${this.state.value}`);
  };

  render() {
    const { value, isValid } = this.state;

    return (
      <React.Fragment>
        <Page className="pf-u-h-100vh">
          <RoutedConnectedMasthead />
          <PageSection variant={PageSectionVariants.default}>
            <Breadcrumb homeClickedCallback={() => {}} threadName="Application settings" />
            <Grid gutter="md">
              <GridItem mdOffset={4} md={12}>
                <h3 className="pf-c-title pf-m-2xl pf-u-mt-sm">Application settings</h3>
                <Card className="pf-u-w-50 pf-u-my-xl">
                  <CardHeader>
                    <h4 className="pf-c-title pf-m-lg">Subscribed content</h4>
                  </CardHeader>
                  <CardBody>
                    To display solution patterns on the Home page, add the URLs for Git repositories here. Red Hat
                    Solution Explorer default content is already included.{' '}
                    <a
                      href="/tutorial/tutorial-web-app-walkthroughs-walkthroughs-publishing-walkthroughs/"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Learn more about subscribed content.
                    </a>
                  </CardBody>
                  <CardHeader>
                    <h4 className="pf-c-title pf-m-sm">Git URL(s) for subscribed content</h4>
                  </CardHeader>
                  <CardBody />
                  <CardBody>
                    <Form>
                      <FormGroup
                        label="List URLs in the order you want them to appear on the Home page:"
                        type="text"
                        helperText="Enter one value per line. Example: https://www.github.com/integr8ly/tutorial-web-app-walkthroughs"
                        helperTextInvalid="URL syntax is incorrect. Example: https://www.github.com/integr8ly/tutorial-web-app-walkthroughs"
                        fieldId="repo-formgroup"
                        isValid={isValid}
                      >
                        <TextArea
                          isValid={isValid}
                          value={this.state.value}
                          // value={this.props.getUserWalkthroughs.data || 'not set'}
                          id="repo-textfield"
                          aria-describedby="repo-formgroup"
                          onChange={this.handleTextInputChange}
                          className="integr8ly-settings"
                        />
                      </FormGroup>
                    </Form>
                  </CardBody>
                  <CardBody>
                    IMPORTANT: Adding or removing Git URLs changes the list of solution patterns available to everyone
                    using the cluster.
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
      </React.Fragment>
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
