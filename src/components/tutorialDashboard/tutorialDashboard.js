import React from 'react';
import PropTypes from 'prop-types';
import { CardGrid, Col, Row, Icon } from 'patternfly-react';
import TutorialCard from '../tutorialCard/tutorialCard';

const TutorialDashboard = props => {
  const { walkthroughs, userProgress } = props;

  return (
    <div className="integr8ly-tutorial-dashboard panel panel-default">
      <div className="panel-heading panel-title">
        <h2>Start with a walkthrough</h2>
        <div className="walkthrough-counter">{walkthroughs.length} walkthroughs</div>
      </div>
      <div className="panel-content cards-pf">
        <CardGrid matchHeight style={{ width: 'calc(100% - 40px)' }}>
          <Row>
            {walkthroughs.map((walkthrough, i) => (
              <Col xs={12} sm={4}>
                <TutorialCard
                  title={walkthrough.title}
                  getStartedLink={`/tutorial/${walkthrough.id}`}
                  getStartedText={
                    userProgress.find(thread => thread.threadId === walkthrough.id) === undefined
                      ? 'Get Started'
                      : 'Resume'
                  }
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

TutorialDashboard.propTypes = {
  userProgress: PropTypes.object,
  walkthroughs: PropTypes.object
};

TutorialDashboard.defaultProps = {
  userProgress: [],
  walkthroughs: []
};

export { TutorialDashboard as default, TutorialDashboard };
