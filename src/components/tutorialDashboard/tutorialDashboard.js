import React from 'react';
import PropTypes from 'prop-types';
import { CardGrid, Col, Row, Icon, noop } from 'patternfly-react';
import TutorialCard from '../tutorialCard/tutorialCard';
import { getProgress } from '../../services/userServices';
import { connect } from '../../redux';

class TutorialDashboard extends React.Component {
  threadStates = {};

  componentDidMount() {
    this.loadUserState();
  }

  loadUserState = () => {
    const { getUserProgress } = this.props;
    getUserProgress();
  };

  render = () => (
    <div className="integr8ly-tutorial-dashboard panel panel-default">
      <div className="panel-heading panel-title">
        <h2>Start with a walkthrough</h2>
        <div className="walkthrough-counter">4 walkthroughs</div>
      </div>
      <div className="panel-content cards-pf">
        <CardGrid matchHeight style={{ width: 'calc(100% - 40px)' }}>
          <Row>
            <Col xs={12} sm={4}>
              <TutorialCard
                title="Configuring the environment"
                getStartedLink="/tutorial/0"
                getStartedText="Get Started"
                getStartedIcon={<Icon type="fa" name="arrow-circle-o-right" className="fa-lg" />}
                minsIcon={<Icon type="fa" name="clock-o" className="fa-lg" style={{ paddingRight: 5 }} />}
                mins={40}
              >
                <p>Complete these configuration tasks to ensure that you can complete all walkthroughs.</p>
              </TutorialCard>
            </Col>
            <Col xs={12} sm={4}>
              <TutorialCard
                title="Integrating event-driven and API-driven applications (AMQ)"
                getStartedLink="/tutorial/1"
                getStartedText="Get Started"
                getStartedIcon={<Icon type="fa" name="arrow-circle-o-right" className="fa-lg" />}
                minsIcon={<Icon type="fa" name="clock-o" className="fa-lg" style={{ paddingRight: 5 }} />}
                mins={40}
              >
                <p>
                  Build a simple integration that enables a new fruit type to be added to an inventory list for a
                  fictional grocery using Red Hat AMQ.
                </p>
              </TutorialCard>
            </Col>
            <Col xs={12} sm={4}>
              <TutorialCard
                title="Integrating event-driven and API-driven applications (EnMasse)"
                getStartedLink="/tutorial/1A"
                getStartedText="Get Started"
                getStartedIcon={<Icon type="fa" name="arrow-circle-o-right" className="fa-lg" />}
                minsIcon={<Icon type="fa" name="clock-o" className="fa-lg" style={{ paddingRight: 5 }} />}
                mins={40}
              >
                <p>
                  Build a simple integration that enables a new fruit type to be added to an inventory list for a
                  fictional grocery using EnMasse.
                </p>
              </TutorialCard>
            </Col>
            <Col xs={12} sm={4}>
              <TutorialCard
                title="Integrating API-driven applications"
                getStartedLink="#"
                getStartedText=""
                getStartedIcon={<span>&nbsp;</span>}
                minsIcon={<Icon type="fa" name="clock-o" className="fa-lg" style={{ paddingRight: 5 }} />}
                mins={0}
              >
                <p>Expose and protect an API that reports on arrivals and departures at a fictional airport.</p>
              </TutorialCard>
            </Col>
          </Row>
        </CardGrid>
      </div>
    </div>
  );
}

TutorialDashboard.propTypes = {
  getUserProgress: PropTypes.func
};

TutorialDashboard.defaultProps = {
  getUserProgress: noop
};

const mapDispatchToProps = dispatch => ({
  getUserProgress: () => getProgress(dispatch)
});

const mapStateToProps = state => ({
  ...state.userReducer
});

const ConnectedTutorialDashboard = connect(
  mapStateToProps,
  mapDispatchToProps
)(TutorialDashboard);

export { ConnectedTutorialDashboard as default, TutorialDashboard };
