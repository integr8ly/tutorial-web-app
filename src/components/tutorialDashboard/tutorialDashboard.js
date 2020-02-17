import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Gallery, GalleryItem } from '@patternfly/react-core';
import { ArrowCircleRightIcon, CheckCircleIcon, ClockIcon } from '@patternfly/react-icons';
import TutorialCard from '../tutorialCard/tutorialCard';
import WalkthroughDetails from '../walkthroughDetails/walkthroughDetails';

import { connect, reduxActions } from '../../redux';

const TutorialDashboard = props => {
  const { walkthroughs, userProgress } = props;

  function walkthroughSorter(w1, w2) {
    const a = `${w1.id} ${w1.title}`;
    const b = `${w2.id} ${w2.title}`;
    return a < b ? -1 : 1;
  }

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

  function addCategory(walkthrus) {
    const repoInfo = walkthrus[0].walkthroughLocationInfo;
    let htmlCategory = '';
    if (repoInfo.type === 'path') {
      htmlCategory = <h2 className="pf-c-title pf-m-3xl pf-u-mt-sm pf-u-mb-sm">Locally Installed Solution Patterns</h2>;
    } else if (repoInfo.header === null) {
      const repo = walkthrus[0].walkthroughLocationInfo.remote;
      const repoParts = repo.split('/');
      const repoLastPart = repoParts.length - 1;
      const repoCategory = repoParts[repoLastPart];
      htmlCategory = <h2 className="pf-c-title pf-m-3xl pf-u-mt-sm pf-u-mb-sm">{repoCategory} Solution Patterns</h2>;
    } else {
      htmlCategory = <h2 className="pf-c-title pf-m-3xl pf-u-mt-sm pf-u-mb-sm">{repoInfo.header}</h2>;
    }
    return htmlCategory;
  }

  function addAll(walkthrus) {
    const allRepos = getRepos(walkthrus);
    const htmlSnippet = [];

    for (let i = 0; i < allRepos.length; i++) {
      const filteredWalkthroughs = filterWalkthroughs(walkthrus, allRepos[i]);

      const cards = filteredWalkthroughs.sort(walkthroughSorter).map(walkthrough => {
        const currentProgress = userProgress[walkthrough.id];
        let startedText;
        if (currentProgress === undefined) startedText = 'Get Started';
        else if (currentProgress.progress >= 100) {
          currentProgress.progress = 100;
          startedText = 'Completed';
        } else startedText = 'Resume';

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
                currentProgress !== undefined && currentProgress.progress === 100 ? (
                  <CheckCircleIcon className={'pf-u-mr-xs'} />
                ) : (
                  <ArrowCircleRightIcon className={'pf-u-mr-sm'} />
                )
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
        <div className="integr8ly-tutorial-dashboard-title pf-l-flex pf-u-py-sm" key={`category-${allRepos[i]}`}>
          {addCategory(filteredWalkthroughs)}
          <div className="pf-l-flex__item pf-m-align-right">
            <div>
              {filteredWalkthroughs[0].walkthroughLocationInfo.type === 'path' ||
              !WalkthroughDetails.validWalkthroughDate(filteredWalkthroughs[0].walkthroughLocationInfo.commitDate) ? (
                <div>---</div>
              ) : (
                <div>
                  <a
                    href={filteredWalkthroughs[0].walkthroughLocationInfo.remote}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="fas fa-code-branch integr8ly-repository" />
                    <span className="integr8ly-repository">Repository</span>
                  </a>
                  <span className="integr8ly-authored" />
                  {filteredWalkthroughs[0].walkthroughLocationInfo.remote.includes('https://github.com/integr8ly/')
                    ? 'Red Hat authored '
                    : 'Community authored '}
                  <Badge className="integr8ly-dash-badge">{filteredWalkthroughs.length}</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      );
      htmlSnippet.push(
        <Gallery
          gutter="md"
          key={`gallery-${allRepos[i]}`}
          className="pf-u-mt-sm pf-u-mb-md integr8ly-gallery-override"
        >
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
  walkthroughs: PropTypes.array,
  walkthroughInfo: PropTypes.object
};

TutorialDashboard.defaultProps = {
  userProgress: {},
  walkthroughs: [],
  walkthroughInfo: { data: {} }
};

const mapDispatchToProps = dispatch => ({
  getWalkthroughInfo: id => dispatch(reduxActions.walkthroughActions.getWalkthroughInfo(id))
});

const mapStateToProps = state => ({
  ...state.walkthroughServiceReducers
});

const ConnectedTutorialDashboard = connect(
  mapStateToProps,
  mapDispatchToProps
)(TutorialDashboard);

export { ConnectedTutorialDashboard as default, TutorialDashboard };
