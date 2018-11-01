import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Icon } from 'patternfly-react';
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
    const { t, threadName, threadId, totalTasks, taskPosition } = this.props;
    return (
      <PfBreadcrumb className="integr8ly-breadcrumb">
        <BreadcrumbItem onClick={this.homeClicked} className="integr8ly-breadcrumb-home">
          <Icon className="fa-lg" type="fa" name="home" />
        </BreadcrumbItem>
        {threadName && !taskPosition && <BreadcrumbItem isActive>{threadName}</BreadcrumbItem>}
        {threadName &&
          taskPosition && (
            <React.Fragment>
              <BreadcrumbItem to={`/tutorial/${threadId}`}>{threadName}</BreadcrumbItem>
              <BreadcrumbItem isActive>{t('breadcrumb.task', { taskPosition, totalTasks })}</BreadcrumbItem>
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
  /** Called when the home button is clicked */
  homeClickedCallback: PropTypes.func
};

Breadcrumb.defaultProps = {
  history: {},
  threadName: '',
  threadId: null,
  taskPosition: null,
  totalTasks: null,
  homeClickedCallback: undefined
};

const RoutedBreadcrumb = withRouter(translate()(Breadcrumb));

export { RoutedBreadcrumb as default, Breadcrumb };
