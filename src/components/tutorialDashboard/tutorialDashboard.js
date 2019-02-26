import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';
import { Gallery, GalleryItem } from '@patternfly/react-core';
import { ClockIcon } from '@patternfly/react-icons';
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
                  ? 'check-circle pf-u-mr-xs integr8ly-c-card__status--complete-icon'
                  : 'arrow-circle-right pf-u-mr-sm'
              }
            />
          }
          minsIcon={<ClockIcon className="pf-u-mr-sm" />}
          progress={currentProgress === undefined ? 0 : currentProgress.progress}
          mins={walkthrough.time}
        >
          <p>{walkthrough.shortDescription}</p>
        </TutorialCard>
      </GalleryItem>
    );
  });

  return (
    <div className="integr8ly-tutorial-dashboard pf-u-mb-0">
      <div className="integr8ly-tutorial-dashboard-title pf-u-display-flex pf-u-py-sm">
        <h2 className="pf-c-title pf-m-3xl pf-u-mt-sm">Start with a walkthrough</h2>
        <div className="integr8ly-walkthrough-counter pf-u-mt-md pf-u-text-align-right pf-m-sm">
          <strong>{walkthroughs.length} walkthroughs</strong>
        </div>
      </div>
      <Gallery gutter="md">{cards}</Gallery>
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
