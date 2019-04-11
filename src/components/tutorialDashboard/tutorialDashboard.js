import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';
import { Gallery, GalleryItem } from '@patternfly/react-core';
import { ClockIcon } from '@patternfly/react-icons';
import TutorialCard from '../tutorialCard/tutorialCard';

const TutorialDashboard = props => {
  const { walkthroughs, userProgress } = props;

  function filterWalkthroughs(walkthrus, filter) {
    let result = [];
    if (walkthrus[0]) {
      result = walkthrus.filter(walkthru => walkthru.walkthroughLocationInfo.remote === filter);
      return result;
    }
    return result;
  }

  function getRepos(walkthroughs) {
    const repos = [];

    for (let i = 0; i < walkthroughs.length; i++) {
      const currentWalkthrough = walkthroughs[i];
      const repo = currentWalkthrough.walkthroughLocationInfo.remote;
      if (!repos.includes(repo)) {
        repos.push(repo);
      }
    }
    return repos;
  }

  function walkthroughSorter(w1, w2) {
    const a = `${w1.id} ${w1.title}`;
    const b = `${w2.id} ${w2.title}`;

    return a < b ? -1 : 1;
  }

  function addCategory(walkthroughs) {
    const repo = walkthroughs[0].walkthroughLocationInfo.remote;
    const repoParts = repo.split('/');
    const repoLastPart = repoParts.length - 1;
    const repoCategory = repoParts[repoLastPart];
    const htmlCategory = <h3 className="pf-c-title pf-m-2xl pf-u-mt-sm">{repoCategory} Solution Patterns</h3>;
    return htmlCategory;
  }

  function addAll(walkthroughs) {
    const allRepos = getRepos(walkthroughs);
    const htmlSnippet = [];

    for (let i = 0; i < allRepos.length; i++) {
      const filteredWalkthroughs = filterWalkthroughs(walkthroughs, allRepos[i]);

      const cards = filteredWalkthroughs.sort(walkthroughSorter).map((walkthrough, i) => {
        const currentProgress = userProgress[walkthrough.id];
        let startedText;
        if (currentProgress === undefined) startedText = 'Get Started';
        else if (currentProgress.progress === 100) startedText = 'Completed';
        else startedText = 'Resume';

        return (
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
      htmlSnippet.push(
        <div className="integr8ly-tutorial-dashboard-title pf-u-display-flex pf-u-py-sm">
          {addCategory(filteredWalkthroughs)}
          <div className="integr8ly-walkthrough-counter pf-u-mt-lg pf-u-mr-md pf-u-text-align-right pf-m-sm">
            {filteredWalkthroughs.length === 1 ? (
              <strong>{filteredWalkthroughs.length} walkthough</strong>
            ) : (
              <strong>{filteredWalkthroughs.length} walkthoughs</strong>
            )}
          </div>
        </div>
      );
      htmlSnippet.push(<Gallery gutter="md">{cards}</Gallery>);
    }
    return htmlSnippet;
  }
  return <div className="integr8ly-tutorial-dashboard pf-u-mb-0">{addAll(walkthroughs)}</div>;
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
