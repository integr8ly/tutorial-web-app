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
  history: PropTypes.object,
  t: PropTypes.func.isRequired,
  threadName: PropTypes.string,
  threadId: PropTypes.string,
  taskPosition: PropTypes.number,
  totalTasks: PropTypes.number,
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
