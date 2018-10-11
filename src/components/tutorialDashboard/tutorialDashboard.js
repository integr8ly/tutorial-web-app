import React from 'react';
import PropTypes from 'prop-types';
import { CardGrid, Col, Row, Icon } from 'patternfly-react';
import TutorialCard from '../tutorialCard/tutorialCard';

const TutorialDashboard = props => {
  const { walkthroughs, userProgress } = props;

  walkthroughs.map((walkthrough, i) => {
    const currentProgress = userProgress.find(thread => thread.threadId === walkthrough.id);
    let startedText;
    if (currentProgress === undefined) startedText = 'Get Started';
    else if (currentProgress.progress === 100) startedText = 'Completed';
    else startedText = 'Resume';

    return cards.push(
      <Col xs={12} sm={4}>
        <TutorialCard
          title={walkthrough.title}
          getStartedLink={
            currentProgress !== undefined && currentProgress.task + 1 === currentProgress.totalTasks
              ? '#'
              : `/tutorial/${walkthrough.id}/${currentProgress === undefined ? '' : `task/${currentProgress.task + 1}`}`
          }
          getStartedText={startedText}
          getStartedIcon={
            <Icon
              type="fa"
              name={
                currentProgress !== undefined && currentProgress.progress === 100
                  ? 'check-circle-o'
                  : 'arrow-circle-o-right'
              }
              className="fa-lg"
            />
          }
          minsIcon={<Icon type="fa" name="clock-o" className="fa-lg" arrow-alt-circle-right />}
          progress={currentProgress === undefined ? 0 : currentProgress.progress}
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
  userProgress: PropTypes.array,
  walkthroughs: PropTypes.array
};

TutorialDashboard.defaultProps = {
  userProgress: [],
  walkthroughs: []
};

export { TutorialDashboard as default, TutorialDashboard };
