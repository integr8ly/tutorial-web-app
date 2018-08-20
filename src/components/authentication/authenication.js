import React from 'react';
import PropTypes from 'prop-types';
import { noop, Button, Card, Form, Grid } from 'patternfly-react';
import { connect, reduxActions } from '../../redux';
import apiTypes from '../../constants/apiConstants';
import { fieldValidation } from '../formField/formField';
import { OC_MODE } from '../../common/helpers';
import titleImgBrand from '../../img/login-reversed.svg';

// todo: use patternfly-react LoginPage comonent

class Authentication extends React.Component {
  state = {
    email: '',
    emailError: null,
    password: '',
    passwordError: null,
    remember: false,
    formTouched: false,
    formValid: false
  };

  componentDidMount() {
    const { session, checkUser, storeData } = this.props;

    if (!session.authorized) {
      checkUser();
      storeData();
    }
  }

  onChangeEmail = event => {
    const { value } = event.target;
    const errorMessage = fieldValidation.isEmpty(value) ? 'Email must be valid' : '';

    this.setState(
      {
        email: value,
        emailError: errorMessage,
        formTouched: true
      },
      () => this.isFormValid()
    );
  };

  onChangePassword = event => {
    const { value } = event.target;
    const errorMessage = fieldValidation.isEmpty(value) ? 'Password must be valid' : '';

    this.setState(
      {
        password: value,
        passwordError: errorMessage,
        formTouched: true
      },
      () => this.isFormValid()
    );
  };

  onChangeRemember = event => {
    const { checked } = event.target;
    const { removeStoredData } = this.props;

    if (!checked) {
      removeStoredData().then(() =>
        this.setState({
          remember: checked
        })
      );
    } else {
      this.setState({
        remember: checked
      });
    }
  };

  onLogin = event => {
    const { email, password, remember, formValid } = this.state;
    const { checkUser, loginUser, removeStoredData, storeData } = this.props;

    event.preventDefault();

    if (formValid) {
      this.setState(
        {
          formTouched: false,
          password: '',
          passwordError: null
        },
        () =>
          loginUser({
            [apiTypes.API_SUBMIT_AUTH_USERNAME]: email,
            [apiTypes.API_SUBMIT_AUTH_PASSWORD]: password
          }).then(() => {
            if (remember) {
              storeData({ email });
            } else {
              this.setState(
                {
                  email: '',
                  emailError: null
                },
                () => removeStoredData()
              );
            }

            return checkUser();
          })
      );
    }
  };

  static getDerivedStateFromProps(props, state) {
    let updateInitialState = null;

    if (OC_MODE) {
      updateInitialState = {
        email: (props.session.remember && props.session.storedEmail) || state.email,
        password: state.password,
        emailError: '',
        passwordError: '',
        formValid: true
      };
    } else if (!state.formTouched && props.session.remember && props.session.storedEmail) {
      updateInitialState = {
        email: props.session.storedEmail,
        emailError: '',
        remember: props.session.remember
      };
    }

    return updateInitialState;
  }

  isFormValid() {
    const { emailError, passwordError } = this.state;
    const formValid = emailError === '' && passwordError === '';

    this.setState({
      formValid
    });
  }

  static renderLoading(message = 'Loading...') {
    return (
      <Card className="app-login-loading-card">
        <Card.Body>
          <div className="spinner spinner-xl" />
          <div className="text-center">{message}</div>
        </Card.Body>
      </Card>
    );
  }

  renderLogin() {
    const { email, emailError, formTouched, password, passwordError, remember } = this.state;
    const { session } = this.props;

    return (
      <Card className="app-login-card">
        <header className="login-pf-header">
          <select className="selectpicker">
            <option>English</option>
          </select>
          <h1>Log In to Your Account</h1>
        </header>
        <Card.Body>
          <Form method="post" autoComplete={remember ? 'on' : 'off'} onSubmit={this.onLogin}>
            <div className="app-login-card-error help-block" aria-live="polite">
              {(!formTouched && session.error && session.loginFailed) ||
              (emailError !== '' && emailError !== null) ||
              (passwordError !== '' && passwordError !== null)
                ? 'Email address or password is incorrect.'
                : null}
            </div>
            <Form.FormGroup controlId="email">
              <Form.ControlLabel srOnly>Email address</Form.ControlLabel>
              <Form.FormControl
                bsSize="lg"
                type="email"
                value={email}
                placeholder="Email address"
                required
                name="email"
                onChange={this.onChangeEmail}
              />
            </Form.FormGroup>
            <Form.FormGroup controlId="password">
              <Form.ControlLabel srOnly>Password</Form.ControlLabel>
              <Form.FormControl
                bsSize="lg"
                type="password"
                value={password}
                placeholder="Password"
                required
                name="password"
                onChange={this.onChangePassword}
              />
            </Form.FormGroup>
            <Form.FormGroup controlId="remember" className="login-pf-settings app-login-settings">
              <Form.Checkbox
                name="remember"
                checked={remember}
                inline
                className="checkbox-label"
                onChange={this.onChangeRemember}
              >
                Remember email address
              </Form.Checkbox>
              <Button bsStyle="link" className="sr-only">
                Forgot password?
              </Button>
            </Form.FormGroup>
            <Button type="submit" bsStyle="primary" bsSize="large" className="btn-block">
              Log In
            </Button>
          </Form>
        </Card.Body>
      </Card>
    );
  }

  render() {
    const { children, session } = this.props;

    if (session.authorized) {
      return children;
    }

    return (
      <div className="login-pf app-login fadein">
        <div className="login-pf-page app-login-body">
          <div className="container-fluid">
            <Grid.Row>
              <Grid.Col sm={8} smOffset={2} md={6} mdOffset={3} lg={6} lgOffset={3}>
                <header className="login-pf-page-header">
                  <img className="login-pf-brand" src={titleImgBrand} alt="PatternFly" />
                </header>
                <Grid.Row>
                  <Grid.Col sm={10} smOffset={1} md={8} mdOffset={2} lg={8} lgOffset={2}>
                    {!session.pending && this.renderLogin()}
                    {session.pending && Authentication.renderLoading()}
                  </Grid.Col>
                </Grid.Row>
              </Grid.Col>
            </Grid.Row>
          </div>
        </div>
      </div>
    );
  }
}

Authentication.propTypes = {
  checkUser: PropTypes.func,
  children: PropTypes.node.isRequired,
  loginUser: PropTypes.func,
  removeStoredData: PropTypes.func,
  session: PropTypes.shape({
    error: PropTypes.bool,
    loginFailed: PropTypes.bool,
    authorized: PropTypes.bool,
    pending: PropTypes.bool,
    storedEmail: PropTypes.string,
    remember: PropTypes.bool
  }),
  storeData: PropTypes.func
};

Authentication.defaultProps = {
  checkUser: noop,
  loginUser: noop,
  removeStoredData: noop,
  session: {},
  storeData: noop
};

const mapDispatchToProps = dispatch => ({
  checkUser: () => dispatch(reduxActions.user.checkUser()),
  loginUser: data => dispatch(reduxActions.user.loginUser(data)),
  storeData: data => dispatch(reduxActions.user.storeData(data)),
  removeStoredData: () => dispatch(reduxActions.user.removeStoredData())
});

const mapStateToProps = state => ({ session: state.user.session });

const ConnectedAuthentication = connect(
  mapStateToProps,
  mapDispatchToProps
)(Authentication);

export { ConnectedAuthentication as default, ConnectedAuthentication, Authentication };
