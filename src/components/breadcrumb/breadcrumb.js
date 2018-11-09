import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Icon, Breadcrumb as PfBreadcrumb } from 'patternfly-react';
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
        <PfBreadcrumb.Item onClick={this.homeClicked}>
          <Icon className="fa-lg" type="fa" name="home" />
        </PfBreadcrumb.Item>
        {threadName && !taskPosition && <PfBreadcrumb.Item active>{threadName}</PfBreadcrumb.Item>}
        {threadName &&
          taskPosition && (
            <React.Fragment>
              <PfBreadcrumb.Item href={`/tutorial/${threadId}`}>{threadName}</PfBreadcrumb.Item>
              <PfBreadcrumb.Item active>{t('breadcrumb.task', { taskPosition, totalTasks })}</PfBreadcrumb.Item>
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
