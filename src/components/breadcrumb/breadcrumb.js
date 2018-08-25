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
    const { t, threadName, threadId, modulePosition, totalModules } = this.props;
    return (
      <PfBreadcrumb>
        <PfBreadcrumb.Item onClick={this.homeClicked}>
          <Icon className="fa-lg" type="pf" name="home" />
        </PfBreadcrumb.Item>
        {threadName && !modulePosition && <PfBreadcrumb.Item active>{threadName}</PfBreadcrumb.Item>}
        {threadName &&
          modulePosition && (
            <React.Fragment>
              <PfBreadcrumb.Item href={`#/tutorial/${threadId}`}>{threadName}</PfBreadcrumb.Item>
              <PfBreadcrumb.Item active>{t('breadcrumb.module', { modulePosition, totalModules })}</PfBreadcrumb.Item>
            </React.Fragment>
          )}
      </PfBreadcrumb>
    );
  }
}

Breadcrumb.propTypes = {
  history: PropTypes.object,
  threadName: PropTypes.string,
  threadId: PropTypes.number,
  modulePosition: PropTypes.number,
  totalModules: PropTypes.number,
  t: PropTypes.func.isRequired
};

Breadcrumb.defaultProps = {
  history: {},
  threadName: '',
  threadId: null,
  modulePosition: null,
  totalModules: null
};

const RoutedBreadcrumb = withRouter(translate()(Breadcrumb));

export { RoutedBreadcrumb as default, Breadcrumb };
