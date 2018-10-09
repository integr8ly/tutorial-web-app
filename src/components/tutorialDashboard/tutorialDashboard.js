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


  render = () => {
    const { walkthroughs } = this.props;

    debugger;
    return (
      <div className="integr8ly-tutorial-dashboard panel panel-default">
      <div className="panel-heading panel-title">
        <h2>Start with a walkthrough</h2>
        <div className="walkthrough-counter">4 walkthroughs</div>
      </div>
      <div className="panel-content cards-pf">
        <CardGrid matchHeight style={{ width: 'calc(100% - 40px)' }}>
          <Row>
              {walkthroughs.map((walkthrough, i) => (
                <Col xs={12} sm={4}>
                  <TutorialCard
                    title={walkthrough.title}
                    getStartedLink="#"
                    getStartedText=""
                    getStartedIcon={<span>&nbsp;</span>}
                    minsIcon={<Icon type="fa" name="clock-o" className="fa-lg" style={{ paddingRight: 5 }} />}
                    mins={0}
                  >
                    <p>{walkthrough.descriptionDoc}</p>
                  </TutorialCard>
                </Col>
              ))}
            </Row>
          </CardGrid>
        </div>
      </div>
    );
  };
}

TutorialDashboard.propTypes = {
  getUserProgress: PropTypes.func,
  walkthroughs: PropTypes.object
};

TutorialDashboard.defaultProps = {
  getUserProgress: noop,
  walkthroughs: []
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
