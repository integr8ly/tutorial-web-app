import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { noop, Button } from 'patternfly-react';
import { connect, reduxActions } from '../../redux';

class CongratulationsPage extends React.Component {
  exitTutorial = e => {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/`);
  };

  render = props => (
    <div>
      <h1> Congratulations </h1>
      <Button onClick={e => this.exitTutorial(e)}> Return to Home Page </Button>
      <Button> Launch OpenShift Console </Button>
    </div>
  );
}

CongratulationsPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

CongratulationsPage.defaultProps = {
  history: {
    push: noop
  }
};

const mapDispatchToProps = dispatch => ({
  getThread: (language, id) => dispatch(reduxActions.threadActions.getThread(language, id))
});

const mapStateToProps = state => ({
  ...state.threadReducers
});

const ConnectedCongratulationsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(CongratulationsPage);

const RouterCongratulationsPage = withRouter(CongratulationsPage);

export { RouterCongratulationsPage as default, ConnectedCongratulationsPage, CongratulationsPage };
