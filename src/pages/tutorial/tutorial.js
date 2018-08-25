import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { noop, Badge, Button, Grid, Icon } from 'patternfly-react';
import { connect, reduxActions } from '../../redux';
import Breadcrumb from '../../components/breadcrumb/breadcrumb';
import AsciiDocTemplate from '../../components/asciiDocTemplate/asciiDocTemplate';

class TutorialPage extends React.Component {
  componentDidMount() {
    this.loadThread();
  }

  loadThread() {
    const {
      match: {
        params: { id }
      },
      getThread
    } = this.props;
    if (!Number.isNaN(id)) {
      getThread(id);
    }
  }

  getStarted(e, id) {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/tutorial/${id}/module/0`);
  }

  render() {
    const { t, thread } = this.props;
    if (thread.pending) {
      // todo: loading state
      return null;
    }
    if (thread.error) {
      // todo: error state
      return null;
    }
    if (thread.fulfilled && thread.data) {
      return (
        <React.Fragment>
          <Breadcrumb threadName={thread.data.title} threadId={thread.data.id} />
          <Grid fluid>
            <Grid.Row>
              <Grid.Col xs={12} sm={8}>
                <AsciiDocTemplate template={thread.data.descriptionDoc} />
                <Button bsStyle="primary" onClick={e => this.getStarted(e, thread.data.id)}>
                  {t('tutorial.getStarted')}
                </Button>
              </Grid.Col>
              <Grid.Col sm={4} className="integr8ly-prerequisites">
                <h3>{t('tutorial.prereq')}</h3>
                <AsciiDocTemplate template={thread.data.prerequistesDoc} />
                <h3>{t('tutorial.roles')}</h3>
                <ul className="list-unstyled">
                  {thread.data.roles.map((role, i) => (
                    <li key={i}>
                      <Icon style={{ marginRight: 5 }} type="pf" name="user" />
                      <span>{role}</span>
                    </li>
                  ))}
                </ul>
                <h3>{t('tutorial.installedApplications')}</h3>
                <p>
                  {thread.data.applications.map((application, i) => (
                    <Badge key={i}>{application}</Badge>
                  ))}
                </p>
              </Grid.Col>
            </Grid.Row>
            <Grid.Row>
              <Grid.Col xs={12} sm={8}>
                <h2>
                  {t('tutorial.modulesToComplete')}
                  <div className="pull-right">
                    <Icon type="fa" name="clock-o" />{' '}
                    <span>
                      {thread.data.estimatedTime} {t('tutorial.minutes')}
                    </span>
                  </div>
                </h2>
                <AsciiDocTemplate template={thread.data.modulesDoc} />
              </Grid.Col>
            </Grid.Row>
          </Grid>
        </React.Fragment>
      );
    }
    return null;
  }
}

TutorialPage.propTypes = {
  t: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }),
  match: PropTypes.shape({
    params: PropTypes.object
  }),
  getThread: PropTypes.func,
  thread: PropTypes.object
};

TutorialPage.defaultProps = {
  history: {
    push: noop
  },
  match: {
    params: {}
  },
  getThread: noop,
  thread: null
};

const mapDispatchToProps = dispatch => ({
  getThread: id => dispatch(reduxActions.threadActions.getThread(id))
});

const mapStateToProps = state => ({
  ...state.threadReducers
});

const ConnectedTutorialPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(TutorialPage));

const RoutedTutorialPage = withRouter(ConnectedTutorialPage);

export { RoutedTutorialPage as default, ConnectedTutorialPage, TutorialPage };
