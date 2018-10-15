import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { noop, Grid, Button } from 'patternfly-react';
import { connect, reduxActions } from '../../redux';
import PfMasthead from '../../components/masthead/masthead';

class CongratulationsPage extends React.Component {
  exitTutorial = e => {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/`);
  };

  render() {
    const { threadName } = this.props;
    return (
      <Grid fluid>
        <Grid.Row>
          <PfMasthead />
        </Grid.Row>
        <Grid.Row>
          <Grid.Col xs={12} className="integr8ly-module integr8ly-module-congratulations mb-0">
            <div className="integr8ly-module-column">
              <div className="integr8ly-module-column--steps integr8ly-congratulations">
                <span className="integr8ly-congratulations_logo" />
                <span className="integr8ly-congratulations_icon" />
                <h2 className="integr8ly-congratulations_heading">
                  Congratulations, you completed the
                  <br /> &quot;Integrating event-driven and API-driven applications
                  {threadName}
                  &quot; <br /> walkthrough!
                </h2>
                <p className="integr8ly-congratulations_paragraph">
                  Return to your homepage to explore more walkthroughs or go to your OpenShift console to utilize what
                  you just built!
                </p>
                <div className="integr8ly-congratulations_buttons">
                  <Button onClick={e => this.exitTutorial(e)}> Return to Home Page </Button>
                  <Button> Launch OpenShift Console </Button>
                </div>
              </div>
            </div>
          </Grid.Col>
        </Grid.Row>
      </Grid>
    );
  }
}

CongratulationsPage.propTypes = {
  threadName: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

CongratulationsPage.defaultProps = {
  threadName: '',
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
