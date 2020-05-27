import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { BreadcrumbItem, Breadcrumb as PfBreadcrumb } from '@patternfly/react-core';
import { withRouter } from 'react-router-dom';

class Breadcrumb extends React.Component {
  homeClicked = () => {
    const { homeClickedCallback } = this.props;
    this.props.history.push('/home');
    if (homeClickedCallback) {
      homeClickedCallback();
    }
  };

  render() {
    const { t, threadName, threadId, totalTasks, taskPosition, isAllSolutionPattern } = this.props;
    return (
      <PfBreadcrumb aria-label="Breadcrumb">
        <BreadcrumbItem to="#" onClick={this.homeClicked} id="breadcrumb-home">
          Home
        </BreadcrumbItem>
        {isAllSolutionPattern && <BreadcrumbItem to="/solution-patterns">Solution Patterns</BreadcrumbItem>}
        {threadName && !taskPosition && <BreadcrumbItem isActive>{threadName}</BreadcrumbItem>}
        {threadName &&
          taskPosition && (
            <React.Fragment>
              <BreadcrumbItem to={`/tutorial/${threadId}`}>{threadName}</BreadcrumbItem>
              <BreadcrumbItem isActive aria-current="page">
                {t('breadcrumb.task', { taskPosition, totalTasks })}
              </BreadcrumbItem>
            </React.Fragment>
          )}
      </PfBreadcrumb>
    );
  }
}

Breadcrumb.propTypes = {
  /**  Navigation history */
  history: PropTypes.object,
  /** Translation function provided for i18n */
  t: PropTypes.func.isRequired,
  /** Walkthrough name (thread) that will show up in the breadcrumb link */
  threadName: PropTypes.string,
  /** Walkthrough ID (thread) */
  threadId: PropTypes.string,
  /** Current task in the walkthrough that the user is on */
  taskPosition: PropTypes.number,
  /** The total number of tasks for this walkthrough */
  totalTasks: PropTypes.number,
  /** Called when the 'home' button is clicked */
  homeClickedCallback: PropTypes.func,
  /** Called when the 'solution patterns' button is clicked */
  solutionPatternsClickedCallback: PropTypes.func,
  /** Checks to see if all solutions pattern is in path */
  isAllSolutionPattern: PropTypes.bool
};

Breadcrumb.defaultProps = {
  history: {},
  threadName: '',
  threadId: null,
  taskPosition: null,
  totalTasks: null,
  homeClickedCallback: undefined,
  solutionPatternsClickedCallback: undefined,
  isAllSolutionPattern: false
};

const RoutedBreadcrumb = withRouter(translate()(Breadcrumb));

export { RoutedBreadcrumb as default, Breadcrumb };
