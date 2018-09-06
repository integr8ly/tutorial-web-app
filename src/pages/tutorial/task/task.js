import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { noop, Alert, Button, ButtonGroup, Grid, Icon, ProgressBar } from 'patternfly-react';
import { connect, reduxActions } from '../../../redux';
import Breadcrumb from '../../../components/breadcrumb/breadcrumb';
import AsciiDocTemplate from '../../../components/asciiDocTemplate/asciiDocTemplate';

class TaskPage extends React.Component {
  state = { task: 0 };

  componentDidMount() {
    this.loadThread();
  }

  componentDidUpdate() {
    const {
      match: {
        params: { id, task }
      }
    } = this.props;
    if (!Number.isNaN(id)) {
      const parsedTask = parseInt(task, 10);
      if (id !== this.state.id || parsedTask !== this.state.task) {
        this.loadThread();
      }
    }
  }

  loadThread() {
    const {
      i18n,
      match: {
        params: { id, task }
      },
      getThread
    } = this.props;
    if (!Number.isNaN(id)) {
      getThread(i18n.language, id);
      const parsedTask = parseInt(task, 10);
      this.setState({ id, task: parsedTask });
    }
  }

  goToTask = (e, next) => {
    e.preventDefault();
    const { history } = this.props;
    const { id } = this.state;
    history.push(`/tutorial/${id}/task/${next}`);
  };

  exitTutorial = e => {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/`);
  };

  render() {
    const { t, thread } = this.props;
    const { task } = this.state;
    if (thread.pending) {
      // todo: loading state
      return null;
    }
    if (thread.error) {
      // todo: error state
      return null;
    }
    if (thread.fulfilled && thread.data) {
      const threadTask = thread.data.tasks[task];
      const totalTasks = thread.data.tasks.length;
      const progess = Math.round((task / (totalTasks - 1)) * 100);

      return (
        <React.Fragment>
          <Breadcrumb
            threadName={thread.data.title}
            threadId={thread.data.id}
            taskPosition={task + 1}
            totalTasks={totalTasks}
          />
          <Grid fluid>
            <Grid.Row>
              <Grid.Col xs={12} sm={8} className="integr8ly-module">
                <div className="integr8ly-module-column">
                  <div className="integr8ly-module-column--status">
                    <h4>{threadTask.title}</h4>
                    <ProgressBar className="progress progress-sm" now={progess} />
                  </div>
                  <div className="integr8ly-module-column--steps">
                    <AsciiDocTemplate adoc={threadTask.stepDoc} attributes={threadTask.attributes || {}} />
                    {threadTask.stepDocInfo && (
                      <Alert type="info">
                        <AsciiDocTemplate adoc={threadTask.stepDocInfo} />
                      </Alert>
                    )}
                    {threadTask.stepDocSuccess && (
                      <Alert type="success">
                        <AsciiDocTemplate adoc={threadTask.stepDocSuccess} />
                      </Alert>
                    )}
                    <div className="integr8ly-module-column--status-next">
                      <h4>{t('task.whatsNext')}</h4>
                      <p>{t('task.completeTaskFirst')}</p>
                    </div>
                  </div>
                  <div className="integr8ly-module-column--footer">
                    <div
                      className="btn-group btn-group-justified"
                      role="group"
                      aria-label="module step progress buttons"
                    >
                      {task > 0 && (
                        <ButtonGroup>
                          <Button onClick={e => this.goToTask(e, task - 1)}>
                            <Icon type="fa" name="angle-left" style={{ paddingRight: 5 }} />
                            {t('task.previousTask')}
                          </Button>
                        </ButtonGroup>
                      )}
                      {task + 1 < totalTasks && (
                        <ButtonGroup>
                          <Button onClick={e => this.goToTask(e, task + 1)}>
                            {t('task.nextTask')} <Icon type="fa" name="angle-right" style={{ paddingLeft: 5 }} />
                          </Button>
                        </ButtonGroup>
                      )}
                      {task + 1 === totalTasks && (
                        <ButtonGroup>
                          <Button onClick={e => this.exitTutorial(e)}>
                            {t('task.exitTutorial')} <Icon type="fa" name="angle-right" style={{ paddingLeft: 5 }} />
                          </Button>
                        </ButtonGroup>
                      )}
                    </div>
                  </div>
                </div>
              </Grid.Col>
              <Grid.Col sm={4} className="integr8ly-frame">
                <h2>Helpful Links</h2>
                <h3>OpenShift</h3>
                <ul className="list-unstyled">
                  <li>
                    <a href="https://www.openshift.com/">OpenShift Link 1</a>
                  </li>
                  <li>
                    <a href="https://www.openshift.com/">OpenShift Link 2</a>
                  </li>
                  <li>
                    <a href="https://www.openshift.com/">OpenShift Link 3</a>
                  </li>
                </ul>
                <h3>Fuse</h3>
                <ul className="list-unstyled">
                  <li>
                    <a href="https://www.redhat.com/en/technologies/jboss-middleware/fuse">Fuse Link 1</a>
                  </li>
                  <li>
                    <a href="https://www.redhat.com/en/technologies/jboss-middleware/fuse">Fuse Link 2</a>
                  </li>
                  <li>
                    <a href="https://www.redhat.com/en/technologies/jboss-middleware/fuse">Fuse Link 3</a>
                  </li>
                </ul>
                <h3>EnMasse</h3>
                <ul className="list-unstyled">
                  <li>
                    <a href="http://enmasse.io/">EnMasse Link 1</a>
                  </li>
                  <li>
                    <a href="http://enmasse.io/">EnMasse Link 2</a>
                  </li>
                </ul>
              </Grid.Col>
            </Grid.Row>
          </Grid>
        </React.Fragment>
      );
    }
    return null;
  }
}

TaskPage.propTypes = {
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

TaskPage.defaultProps = {
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

const ConnectedTaskPage = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(translate()(TaskPage))
);

export { ConnectedTaskPage as default, ConnectedTaskPage, TaskPage };
