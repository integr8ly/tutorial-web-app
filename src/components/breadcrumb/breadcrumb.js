import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Icon, Breadcrumb as PfBreadcrumb } from 'patternfly-react';
import { withRouter } from 'react-router-dom';

class Breadcrumb extends React.Component {
  homeClicked = () => {
    this.props.history.push('/home');
  };
  render() {
    const { t, threadName, threadId, taskPosition, totalTasks } = this.props;
    return (
      <PfBreadcrumb>
        <PfBreadcrumb.Item onClick={this.homeClicked}>
          <Icon className="fa-lg" type="pf" name="home" />
        </PfBreadcrumb.Item>
        {threadName && !taskPosition && <PfBreadcrumb.Item active>{threadName}</PfBreadcrumb.Item>}
        {threadName &&
          taskPosition && (
            <React.Fragment>
              <PfBreadcrumb.Item href={`#/tutorial/${threadId}`}>{threadName}</PfBreadcrumb.Item>
              <PfBreadcrumb.Item active>{t('breadcrumb.task', { taskPosition, totalTasks })}</PfBreadcrumb.Item>
            </React.Fragment>
          )}
        <li className="pull-right text-dark integr8ly-breadcrumb-special">
          <i className="fa fa-hourglass-half" /> 7 Days remaining
        </li>
      </PfBreadcrumb>
    );
  }
}

Breadcrumb.propTypes = {
  history: PropTypes.object,
  threadName: PropTypes.string,
  threadId: PropTypes.number,
  taskPosition: PropTypes.number,
  totalTasks: PropTypes.number,
  t: PropTypes.func.isRequired
};

Breadcrumb.defaultProps = {
  history: {},
  threadName: '',
  threadId: null,
  taskPosition: null,
  totalTasks: null
};

const RoutedBreadcrumb = withRouter(translate()(Breadcrumb));

export { RoutedBreadcrumb as default, Breadcrumb };
