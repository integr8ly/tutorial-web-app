import React from 'react';
import PropTypes from 'prop-types';
import { CardGrid, Col, Row, Icon } from 'patternfly-react';
import TutorialCard from '../tutorialCard/tutorialCard';

const TutorialDashboard = props => {
  const { walkthroughs, userProgress } = props;
  const cards = [];

  walkthroughs.map((walkthrough, i) => {
    const progress = userProgress.find(thread => thread.threadId === walkthrough.id);
    return cards.push(
      <Col xs={12} sm={4}>
        <TutorialCard
          title={walkthrough.title}
          getStartedLink={
            progress !== undefined && progress.task + 1 === progress.totalTasks
              ? '#'
              : `/tutorial/${walkthrough.id}/${progress === undefined ? '' : `task/${progress.task + 1}`}`
          }
          getStartedText={progress === undefined ? 'Get Started' : 'Resume'}
          getStartedIcon={<Icon type="fa" name="arrow-circle-o-right" className="fa-lg" />}
          minsIcon={<Icon type="fa" name="clock-o" className="fa-lg" arrow-alt-circle-right />}
          progress={progress === undefined ? 0 : progress.progress}
          mins={walkthrough.estimatedTime}
        >
          <p>{walkthrough.descriptionDoc}</p>
        </TutorialCard>
      </Col>
    );
  });

  return (
    <div className="integr8ly-tutorial-dashboard panel panel-default">
      <div className="panel-heading panel-title">
        <h2>Start with a walkthrough</h2>
        <div className="walkthrough-counter">{walkthroughs.length} walkthroughs</div>
      </div>
      <div className="panel-content cards-pf">
        <CardGrid matchHeight style={{ width: 'calc(100% - 40px)' }}>
          <Row>{cards}</Row>
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
