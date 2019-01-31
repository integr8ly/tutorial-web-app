import React from 'react';
import PropTypes from 'prop-types';
import { CardGrid, Icon } from 'patternfly-react';
import { Gallery, GalleryItem } from '@patternfly/react-core';
import TutorialCard from '../tutorialCard/tutorialCard';

const TutorialDashboard = props => {
  const { walkthroughs, userProgress } = props;
  const cards = [];
  walkthroughs.map((walkthrough, i) => {
    const currentProgress = userProgress[walkthrough.id];
    let startedText;
    if (currentProgress === undefined) startedText = 'Get Started';
    else if (currentProgress.progress === 100) startedText = 'Completed';
    else startedText = 'Resume';

    return cards.push(
      <GalleryItem key={walkthrough.id}>
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
                  ? 'check-circle integr8ly-c-card__status--complete-icon'
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
            {walkthrough.community === true ? <span className="label integr8ly-label">community</span> : <span />}
            {walkthrough.preview === true ? <span className="label integr8ly-label">preview</span> : <span />}
          </div>
        </TutorialCard>
      </GalleryItem>
    );
  });

  return (
    <div className="integr8ly-tutorial-dashboard pf-u-px-sm">
      <div className="integr8ly-tutorial-dashboard-title pf-u-py-sm">
        <h2 className="pf-c-title pf-m-3xl pf-u-mt-sm pf-u-ml-md">Start with a walkthrough</h2>
        <div className="integr8ly-walkthrough-counter pf-u-mr-md">{walkthroughs.length} walkthroughs</div>
      </div>
      <div className="cards-pf">
        <CardGrid
          className="pf-u-mt-0 pf-u-ml-md pf-u-pl-sm pf-u-pr-0"
          matchHeight
          style={{ width: 'calc(100% - 40px)' }}
        >
          <Gallery gutter="md">{cards}</Gallery>
        </CardGrid>
      </div>
      <CardGrid className="pf-u-mt-0 pf-u-ml-md pf-u-pl-sm pf-u-pr-0" style={{ width: 'calc(100% - 40px)' }}>
        <Gallery gutter="md">{cards}</Gallery>
      </CardGrid>
    </div>
  );
};

TutorialDashboard.propTypes = {
  userProgress: PropTypes.object,
  walkthroughs: PropTypes.array
};

TutorialDashboard.defaultProps = {
  userProgress: {},
  walkthroughs: []
};

export { TutorialDashboard as default, TutorialDashboard };
