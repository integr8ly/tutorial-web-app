import React from 'react';
import PropTypes from 'prop-types';
import { connect, reduxActions } from '../../redux';
import apiTypes from '../../constants/apiConstants';
import { noop, OC_MODE } from '../../common/helpers';

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

  render() {
    const { children, session } = this.props;
    if (session.authorized) {
      return children;
    }

    return null;
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
  checkUser: () => dispatch(reduxActions.userActions.checkUser()),
  loginUser: data => dispatch(reduxActions.userActions.loginUser(data)),
  storeData: data => dispatch(reduxActions.userActions.storeData(data)),
  removeStoredData: () => dispatch(reduxActions.userActions.removeStoredData())
});

const mapStateToProps = state => ({ session: state.userReducers.session });

const ConnectedAuthentication = connect(
  mapStateToProps,
  mapDispatchToProps
)(Authentication);

export { ConnectedAuthentication as default, ConnectedAuthentication, Authentication };
