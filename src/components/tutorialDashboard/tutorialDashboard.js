import React from 'react';
import PropTypes from 'prop-types';
import { CardGrid, Col, Row, Icon } from 'patternfly-react';
import TutorialCard from '../tutorialCard/tutorialCard';

const TutorialDashboard = props => {
  const { walkthroughs, userProgress } = props;
  const cards = [];
  walkthroughs.map((walkthrough, i) => {
    const currentProgress = userProgress.find(thread => thread.threadId === walkthrough.id);
    let startedText;
    if (currentProgress === undefined) startedText = 'Get Started';
    else if (currentProgress.progress === 100) startedText = 'Completed';
    else startedText = 'Resume';

    return cards.push(
      <Col xs={12} sm={4} key={walkthrough.id}>
        <TutorialCard
          title={walkthrough.title}
          getStartedLink={
            currentProgress !== undefined && currentProgress.task + 1 === currentProgress.totalTasks
              ? `/tutorial/${walkthrough.id}`
              : `/tutorial/${walkthrough.id}/${currentProgress === undefined ? '' : `task/${currentProgress.task}`}`
          }
          getStartedText={startedText}
          getStartedIcon={
            <Icon
              type="fa"
              name={
                currentProgress !== undefined && currentProgress.progress === 100
                  ? 'check-circle'
                  : 'arrow-circle-right'
              }
              className="fa-lg"
            />
          }
          minsIcon={<Icon type="fa" name="clock" className="fa-lg" arrow-alt-circle-right="true" />}
          progress={currentProgress === undefined ? 0 : currentProgress.progress}
          mins={walkthrough.time}
        >
          <p>{walkthrough.shortDescription}</p>

          <div className="integr8ly-walkthrough-labels">
            {walkthrough.community === true ? (
              <span className="integr8ly-label-community integr8ly-walkthrough-labels-tag">community</span>
            ) : (
              <span />
            )}
            {walkthrough.preview === true ? (
              <span className="integr8ly-label-preview integr8ly-walkthrough-labels-tag">preview</span>
            ) : (
              <span />
            )}
          </div>
        </TutorialCard>
      </Col>
    );
  });

  return (
    <div className="integr8ly-tutorial-dashboard panel panel-default">
      <div className="panel-heading panel-title">
        <h1 className="pf-c-title pf-m-3xl">Start with a walkthrough</h1>
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
