import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { noop, Alert, Button, ButtonGroup, Checkbox, Grid, Icon, ProgressBar } from 'patternfly-react';
import { connect, reduxActions } from '../../../redux';
import Breadcrumb from '../../../components/breadcrumb/breadcrumb';
import AsciiDocTemplate from '../../../components/asciiDocTemplate/asciiDocTemplate';
import { provisionWalkthroughOne } from '../../../services/walkthroughProvisionServices';

class TaskPage extends React.Component {
  state = { task: 0, verifications: {}, verificationsChecked: false };

  componentDidMount() {
    this.loadThread();
    if (this.props.match.params.id === '0') {
      provisionWalkthroughOne(this.props.middlewareServices.amqCredentials);
    }
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
      const parsedTask = parseInt(task, 10);
      this.setState({ id, task: parsedTask });
      getThread(i18n.language, id).then(thread => {
        const verifications = {};
        const threadTask = thread.value.data.tasks[parsedTask];
        threadTask.steps.forEach(step => {
          if (step.infoVerifications) {
            step.infoVerifications.forEach(verification => {
              verifications[verification] = false;
            });
          }
        });
        const hasVerifications = Object.keys(verifications).length > 0;
        this.setState({ verifications, verificationsChecked: !hasVerifications });
      });
    }
  }

  backToIntro = e => {
    e.preventDefault();
    const { history } = this.props;
    const { id } = this.state;
    history.push(`/tutorial/${id}`);
  };

  goToTask = (e, next) => {
    e.preventDefault();
    const { history } = this.props;
    const { id } = this.state;
    history.push(`/tutorial/${id}/task/${next}`);
  };

  exitTutorial = e => {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/congratulations/${this.props.thread.data.id}`);
  };

  handleVerificationChanged = (e, verification) => {
    const o = Object.assign({}, this.state.verifications);
    o[verification] = !!e.target.checked;
    const verificationsChecked = Object.values(o).every(v => v === true);
    this.setState({ verifications: o, verificationsChecked });
  };

  render() {
    const { t, thread } = this.props;
    const { task, verifications, verificationsChecked } = this.state;
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
      const progress = Math.round((task / (totalTasks - 1)) * 100);

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
              <Grid.Col xs={12} sm={9} className="integr8ly-module">
                <div className="integr8ly-module-column">
                  <div className="integr8ly-module-column--status">
                    <ProgressBar className="progress progress-label-left" now={progress} label={`${progress}%`}>
                      <span>Walkthrough</span>
                    </ProgressBar>
                  </div>
                  <div className="integr8ly-module-column--steps">
                    {threadTask.steps.map((step, i) => (
                      <React.Fragment key={i}>
                        <AsciiDocTemplate adoc={step.stepDoc} attributes={step.attributes || {}} />
                        {step.infoVerifications &&
                          step.infoVerifications.map((verification, j) => (
                            <Alert type="info" key={j}>
                              <strong>{t('task.verificationTitle')}</strong>
                              <Checkbox
                                checked={verifications[verification] || false}
                                onChange={e => {
                                  this.handleVerificationChanged(e, verification);
                                }}
                              >
                                <AsciiDocTemplate adoc={verification} attributes={step.attributes || {}} />
                              </Checkbox>
                            </Alert>
                          ))}
                        {step.successVerifications &&
                          step.successVerifications.map((verification, k) => (
                            <Alert type="success" key={k}>
                              <strong>{t('task.verificationTitle')}</strong>
                              <AsciiDocTemplate adoc={verification} attributes={step.attributes || {}} />
                            </Alert>
                          ))}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="integr8ly-module-column--footer">
                    <h6>{t('task.CompleteAndCheck')}</h6>
                    <div className="integr8ly-module-column--footer_status">
                      <Icon type="fa" name="circle-o" />
                      <span className="integr8ly-module-column--footer_status-step">1.1</span>
                      <Icon type="fa" name="circle-o" />
                      <span className="integr8ly-module-column--footer_status-step">1.2</span>
                      <Icon type="fa" name="circle-o" />
                      <span className="integr8ly-module-column--footer_status-step">1.3</span>
                    </div>
                    <div
                      className="btn-group btn-group-justified"
                      role="group"
                      aria-label="module step progress buttons"
                    >
                      {task === 0 && (
                        <ButtonGroup>
                          <Button onClick={e => this.backToIntro(e)}>
                            <Icon type="fa" name="angle-left" style={{ paddingRight: 5 }} />
                            {t('task.backToIntro')}
                          </Button>
                        </ButtonGroup>
                      )}
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
                          <Button
                            bsStyle={verificationsChecked ? 'primary' : 'default'}
                            onClick={e => this.goToTask(e, task + 1)}
                          >
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
              <Grid.Col sm={3} className="integr8ly-frame">
                <h4 className="integr8ly-helpful-links-heading">Helpful Links</h4>
                <h4 className="integr8ly-helpful-links-product-title">Red Hat OpenShift</h4>
                <ul className="list-unstyled">
                  <li>
                    <a href="https://help.openshift.com/">OpenShift Online Help Center</a>
                  </li>
                  <li>
                    <a href="https://blog.openshift.com/">OpenShift Blog</a>
                  </li>
                </ul>
                <h4 className="integr8ly-helpful-links-product-title">
                  Red Hat Fuse
                  <span className="label label-default integr8ly-label-non-ga">Non-GA</span>
                </h4>
                <ul className="list-unstyled">
                  <li>
                    <a href="https://developers.redhat.com/products/fuse/help/">Fuse Community Q&amp;A</a>
                  </li>
                  <li>
                    <a href="https://developers.redhat.com/videos/vimeo/95497167/">Fuse Overview</a>
                  </li>
                </ul>
                <h4 className="integr8ly-helpful-links-product-title">Red Hat AMQ</h4>
                <ul className="list-unstyled">
                  <li>
                    <a href="https://developers.redhat.com/products/amq/help/">AMQ Community Q&amp;A</a>
                  </li>
                  <li>
                    <a href="https://access.redhat.com/products/red-hat-amq">AMQ Videos</a>
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
  ...state.threadReducers,
  ...state.middlewareReducers
});

const ConnectedTaskPage = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(translate()(TaskPage))
);

export { ConnectedTaskPage as default, ConnectedTaskPage, TaskPage };
