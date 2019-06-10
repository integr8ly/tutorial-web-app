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

  function getRepos(walkthrus) {
    const repos = [];

    for (let i = 0; i < walkthrus.length; i++) {
      const currentWalkthrough = walkthrus[i];
      const repo = currentWalkthrough.walkthroughLocationInfo.remote;
      if (!repos.includes(repo)) {
        repos.push(repo);
      }
    }
    return repos;
  }

  function wtSortByProgress(w1, w2) {
    const a = [userProgress[w1.id], w1.title];
    const b = [userProgress[w2.id], w2.title];

    if (a[0] === undefined && b[0] === undefined) {
      return a[1] < b[1] ? -1 : 1;
    }
    if (a[0] !== undefined && b[0] !== undefined) {
      return a[0].progress > b[0].progress ? -1 : 1;
    }
    if (a[0] === undefined && b[0] !== undefined) {
      return a > b ? -1 : 1;
    }
    if (a[0] !== undefined && b[0] === undefined) {
      return a > b ? -1 : 1;
    }
    return a[1] < b[1] ? -1 : 1;
  }

  function addCategory(walkthrus) {
    const repoInfo = walkthrus[0].walkthroughLocationInfo;
    let htmlCategory = '';
    if (repoInfo.type === 'path') {
      htmlCategory = <h3 className="pf-c-title pf-m-2xl pf-u-mt-sm">Locally Installed Solution Patterns</h3>;
    } else if (repoInfo.header === null) {
      const repo = walkthrus[0].walkthroughLocationInfo.remote;
      const repoParts = repo.split('/');
      const repoLastPart = repoParts.length - 1;
      const repoCategory = repoParts[repoLastPart];
      htmlCategory = <h3 className="pf-c-title pf-m-2xl pf-u-mt-sm">{repoCategory} Solution Patterns</h3>;
    } else {
      htmlCategory = <h3 className="pf-c-title pf-m-2xl pf-u-mt-sm">{repoInfo.header}</h3>;
    }
    return htmlCategory;
  }

  function addAll(walkthrus) {
    const allRepos = getRepos(walkthrus);
    const htmlSnippet = [];

    for (let i = 0; i < allRepos.length; i++) {
      const filteredWalkthroughs = filterWalkthroughs(walkthrus, allRepos[i]);

      const cards = filteredWalkthroughs.sort(wtSortByProgress).map(walkthrough => {
        const currentProgress = userProgress[walkthrough.id];
        let startedText;
        if (currentProgress === undefined) startedText = 'Get Started';
        else if (currentProgress.progress === 100) startedText = 'Completed';
        else startedText = 'Resume';

        return (
          <GalleryItem id={walkthrough.id} key={walkthrough.id}>
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
        <div
          className="integr8ly-tutorial-dashboard-title pf-u-display-flex pf-u-py-sm"
          key={`category-${allRepos[i]}`}
        >
          {addCategory(filteredWalkthroughs)}
          <div className="integr8ly-walkthrough-counter pf-u-mt-md pf-u-mr-md pf-u-text-align-right pf-m-sm">
            {filteredWalkthroughs.length === 1 ? (
              <strong>{filteredWalkthroughs.length} walkthrough</strong>
            ) : (
              <strong>{filteredWalkthroughs.length} walkthroughs</strong>
            )}
          </div>
        </div>
      );
      htmlSnippet.push(
        <Gallery gutter="md" key={`gallery-${allRepos[i]}`}>
          {cards}
        </Gallery>
      );
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
