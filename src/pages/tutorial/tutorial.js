import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { noop, Button, Grid, Icon, ListView } from 'patternfly-react';
import { connect, reduxActions } from '../../redux';
import Breadcrumb from '../../components/breadcrumb/breadcrumb';
import AsciiDocTemplate from '../../components/asciiDocTemplate/asciiDocTemplate';

class TutorialPage extends React.Component {
  componentDidMount() {
    this.loadThread();
  }

  loadThread() {
    const {
      i18n,
      match: {
        params: { id }
      },
      getThread
    } = this.props;
    if (!Number.isNaN(id)) {
      getThread(i18n.language, id);
    }
  }

  getStarted(e, id) {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/tutorial/${id}/task/0`);
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
              <Grid.Col xs={12} sm={8} className="integr8ly-task-container">
                <AsciiDocTemplate adoc={thread.data.descriptionDoc} />
                <Button bsStyle="primary" onClick={e => this.getStarted(e, thread.data.id)}>
                  {t('tutorial.getStarted')}
                </Button>
              </Grid.Col>
              <Grid.Col sm={4} className="integr8ly-prerequisites">
                {/* <h3>{t('tutorial.prereq')}</h3>
                <ul style={{ paddingLeft: 20 }}>
                  {thread.data.prerequisites.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul> */}
                <h3>Walkthroughs Available</h3>
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
                  <ul className="list-unstyled">
                    {thread.data.applications.map((application, i) => (
                      <li key={i}>{application}</li>
                    ))}
                  </ul>
                </p>
              </Grid.Col>
            </Grid.Row>
            <Grid.Row>
              <Grid.Col xs={12} sm={8}>
                <h2>
                  {t('tutorial.tasksToComplete')}
                  <div className="pull-right">
                    <Icon type="fa" name="clock-o" />{' '}
                    <span>
                      {thread.data.estimatedTime} {t('tutorial.minutes')}
                    </span>
                  </div>
                </h2>

                <ListView className="list-view-pf-integreatly">
                  {/* for UX testing only right now */}
                  <ListView.Item
                    heading="0. Completing prerequisites"
                    description={
                      <div>
                        <ul style={{ paddingLeft: 20 }}>
                          {thread.data.prerequisites.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    }
                    actions={
                      <div>
                        <Icon type="fa" name="clock-o" style={{ marginRight: 5 }} />{' '}
                        <span>10 {t('tutorial.minutes')}</span>
                      </div>
                    }
                    stacked
                  />
                  {thread.data.tasks.map((task, i) => (
                    <ListView.Item
                      key={i}
                      heading={`${i + 1}. ${task.title}`}
                      description={task.description}
                      actions={
                        <div>
                          <Icon type="fa" name="clock-o" style={{ marginRight: 5 }} />{' '}
                          <span>
                            {task.estimatedTime} {t('tutorial.minutes')}
                          </span>
                        </div>
                      }
                      stacked
                    />
                  ))}
                </ListView>
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
  i18n: PropTypes.object,
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
  i18n: {
    language: 'en'
  },
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
  getThread: (language, id) => dispatch(reduxActions.threadActions.getThread(language, id))
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
