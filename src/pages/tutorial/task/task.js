import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { noop, Alert, Button, ButtonGroup, Checkbox, Grid, Icon } from 'patternfly-react';
import { connect, reduxActions } from '../../../redux';
import Breadcrumb from '../../../components/breadcrumb/breadcrumb';
import AsciiDocTemplate from '../../../components/asciiDocTemplate/asciiDocTemplate';
import { prepareWalkthroughNamespace, walkthroughs, WALKTHROUGH_IDS } from '../../../services/walkthroughServices';
import { buildNamespacedServiceInstanceName } from '../../../common/openshiftHelpers';
import { getDocsForWalkthrough } from '../../../common/docsHelpers';

class TaskPage extends React.Component {
  state = { task: 0, verifications: {}, verificationsChecked: false };

  componentDidMount() {
    this.loadThread();
    const { prepareWalkthroughOne, prepareWalkthroughOneA } = this.props;
    if (this.props.match.params.id === WALKTHROUGH_IDS.ONE) {
      prepareWalkthroughOne(this.props.middlewareServices.amqCredentials);
    }
    if (this.props.match.params.id === WALKTHROUGH_IDS.ONE_A) {
      prepareWalkthroughOneA(this.props.middlewareServices.enmasseCredentials);
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
          } else if (step.successVerifications) {
            step.successVerifications.forEach(verification => {
              verifications[verification] = false;
            });
          }
        });
        const hasVerifications = Object.keys(verifications).length > 0;
        this.setState({
          verifications,
          verificationsChecked: !hasVerifications
        });
      });
    }
  }

  updateThreadState = callback => {
    const { thread, setProgress, user } = this.props;
    const { task } = this.state;
    const threadProgress = {
      threadId: thread.data.id.toString(),
      task: this.state.task,
      verifications: this.state.verifications,
      verificationsChecked: this.state.verificationsChecked,
      totalTasks: thread.data.tasks.length,
      progress: Math.round(((task + 1) / thread.data.tasks.length) * 100)
    };

    const progress = Object.assign({}, user.userProgress);

    if (progress.threads.length === 0) {
      progress.threads.push(threadProgress);
    } else {
      // Look through array of threads to see if the thread progress is in the users threads.
      progress.threads.some((threadVal, index) => {
        if (threadVal.threadId === threadProgress.threadId) {
          progress.threads[index] = threadProgress;
          return true;
        } else if (index === progress.threads.length - 1) {
          progress.threads.push(threadProgress);
        }
        return false;
      });
    }
    setProgress(progress);
  };

  // Temporary fix for the Asciidoc renderer not being reactive.
  getDocsAttributes = () => {
    const walkthrough = Object.values(walkthroughs).find(w => w.id === this.props.match.params.id);
    return getDocsForWalkthrough(walkthrough, this.props.middlewareServices, this.props.walkthroughServices);
  };

  getAMQCredential = (middlewareServices, name) => {
    if (!middlewareServices || !middlewareServices.amqCredentials || !middlewareServices.amqCredentials[name]) {
      return null;
    }
    return middlewareServices.amqCredentials[name];
  };

  getUrlFromMiddlewareServices = (middlewareServices, serviceName) => {
    if (!middlewareServices || !middlewareServices.data || !middlewareServices.data[serviceName]) {
      return null;
    }
    const service = middlewareServices.data[serviceName];
    return service.status.dashboardURL || service.metadata.annotations['integreatly/dashboard-url'];
  };

  getUrlFromWalkthroughServices = (walkthroughServices, serviceName) => {
    if (
      !walkthroughServices ||
      !walkthroughServices.services ||
      !walkthroughServices.services[buildNamespacedServiceInstanceName(walkthroughs.one.namespaceSuffix, serviceName)]
    ) {
      return null;
    }
    return walkthroughServices.services[serviceName].spec.host;
  };

  backToIntro = e => {
    e.preventDefault();
    this.updateThreadState();
    const { history } = this.props;
    const { id } = this.state;
    history.push(`/tutorial/${id}`);
  };

  goToTask = (e, next) => {
    e.preventDefault();
    this.updateThreadState();
    const { history } = this.props;
    const { id } = this.state;
    history.push(`/tutorial/${id}/task/${next}`);
  };

  exitTutorial = e => {
    e.preventDefault();
    this.updateThreadState();
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
                  <div className="integr8ly-module-column--steps">
                    {threadTask.steps.map((step, i) => (
                      <React.Fragment key={i}>
                        <AsciiDocTemplate
                          adoc={step.stepDoc}
                          attributes={Object.assign(
                            {},
                            threadTask.attributes,
                            step.attributes,
                            this.getDocsAttributes()
                          )}
                        />
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
                                <AsciiDocTemplate
                                  adoc={verification}
                                  attributes={Object.assign(
                                    {},
                                    threadTask.attributes,
                                    step.attributes,
                                    this.getDocsAttributes()
                                  )}
                                />
                              </Checkbox>
                            </Alert>
                          ))}
                        {step.successVerifications &&
                          step.successVerifications.map((verification, k) => (
                            <Alert type="success" key={k}>
                              <strong>{t('task.verificationTitle')}</strong>
                              <AsciiDocTemplate
                                adoc={verification}
                                attributes={Object.assign(
                                  {},
                                  threadTask.attributes,
                                  step.attributes,
                                  this.getDocsAttributes()
                                )}
                              />
                            </Alert>
                          ))}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="integr8ly-module-column--footer">
                    <h6>{t('task.CompleteAndCheck')}</h6>
                    <div className="integr8ly-module-column--footer_status">
                      {threadTask.steps.map((step, l) => (
                        <React.Fragment key={l}>
                          {step.infoVerifications &&
                            step.infoVerifications.map(() => (
                              <Icon
                                className={
                                  step.infoVerifications && verifications[step.infoVerifications[0]]
                                    ? 'integr8ly-module-column--footer_status-checked'
                                    : 'integr8ly-module-column--footer_status'
                                }
                                type="fa"
                                name={verifications[step.infoVerifications[0]] ? 'check-circle-o' : 'circle-o'}
                              />
                            ))}
                          {step.successVerifications &&
                            step.successVerifications.map(() => (
                              <Icon
                                className={
                                  step.successVerifications && verifications[step.successVerifications[0]]
                                    ? 'integr8ly-module-column--footer_status-checked'
                                    : 'integr8ly-module-column--footer_status'
                                }
                                type="fa"
                                name={verifications[step.successVerifications[0]] ? 'check-circle-o' : 'circle-o'}
                              />
                            ))}
                          {step.infoVerifications &&
                            step.infoVerifications.map(() => (
                              <span
                                className={
                                  verifications[step.infoVerifications[0]]
                                    ? 'integr8ly-module-column--footer_status-checked'
                                    : 'integr8ly-module-column--footer_status-step'
                                }
                              >
                                {task}.{l}
                              </span>
                            ))}
                          {step.successVerifications &&
                            step.successVerifications.map(() => (
                              <span
                                className={
                                  verifications[step.successVerifications[0]]
                                    ? 'integr8ly-module-column--footer_status-checked'
                                    : 'integr8ly-module-column--footer_status-step'
                                }
                              >
                                {task}.{l}
                              </span>
                            ))}
                        </React.Fragment>
                      ))}
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
                            disabled={!verificationsChecked}
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
              <Grid.Col sm={3} className="integr8ly-module-frame">
                {/* <h4 className="integr8ly-helpful-links-heading">Walkthrough Diagram</h4>
                <img src="/images/st0.png" className="img-responsive" alt="integration" /> */}
                <h4 className="integr8ly-helpful-links-heading">Walkthrough Resources</h4>
                <h4 className="integr8ly-helpful-links-product-title">
                  {/* <i className="pficon pficon-on-running" /> */}
                  Red Hat OpenShift
                </h4>
                <ul className="list-unstyled">
                  <li>
                    <a href="https://url/" target="top">
                      Open console
                    </a>
                  </li>
                  <li>
                    <a href="https://help.openshift.com/" target="top">
                      OpenShift Online Help Center
                    </a>
                  </li>
                  <li>
                    <a href="https://blog.openshift.com/" target="top">
                      OpenShift Blog
                    </a>
                  </li>
                </ul>
                <h4 className="integr8ly-helpful-links-product-title">
                  {/* <i className="fa fa-pie-chart" /> */}
                  Red Hat Fuse
                  {/* <span className="label label-default integr8ly-label-preview">Preview</span> */}
                </h4>
                <ul className="list-unstyled">
                  <li>
                    <a href="https://url/" target="top">
                      Open console
                    </a>
                  </li>
                  <li>
                    <a href="https://developers.redhat.com/products/fuse/help/" target="top">
                      Fuse Community Q&amp;A
                    </a>
                  </li>
                  <li>
                    <a href="https://developers.redhat.com/videos/vimeo/95497167/" target="top">
                      Fuse Overview
                    </a>
                  </li>
                </ul>
                <h4 className="integr8ly-helpful-links-product-title">
                  {/* <i className="pficon pficon-pending" /> */}
                  Red Hat AMQ
                  {/* <span className="label label-default integr8ly-label-preview">Preview</span> */}
                </h4>
                <ul className="list-unstyled">
                  <li>
                    <a href="https://url/" target="top">
                      Open console
                    </a>
                  </li>
                  <li>
                    <a href="https://developers.redhat.com/products/amq/help/" target="top">
                      AMQ Community Q&amp;A
                    </a>
                  </li>
                  <li>
                    <a href="https://access.redhat.com/products/red-hat-amq" target="top">
                      AMQ Videos
                    </a>
                  </li>
                </ul>
                <h4 className="integr8ly-helpful-links-product-title">
                  {/* <i className="pficon pficon-error-circle-o" /> */}
                  Eclipse Che
                  {/* <span className="label label-default integr8ly-label-community">Community</span> */}
                </h4>
                <ul className="list-unstyled">
                  <li>
                    <a href="https://url/" target="top">
                      Open console
                    </a>
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
  middlewareServices: PropTypes.object,
  walkthroughServices: PropTypes.object,
  prepareWalkthroughOne: PropTypes.func,
  prepareWalkthroughOneA: PropTypes.func,
  setProgress: PropTypes.func,
  thread: PropTypes.object,
  user: PropTypes.object
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
  middlewareServices: {
    data: {},
    amqCredentials: {},
    enmasseCredentials: {}
  },
  walkthroughServices: {
    services: {}
  },
  prepareWalkthroughOne: noop,
  prepareWalkthroughOneA: noop,
  setProgress: noop,
  thread: null,
  user: null
};

const mapDispatchToProps = dispatch => ({
  getThread: (language, id) => dispatch(reduxActions.threadActions.getThread(language, id)),
  prepareWalkthroughOne: amqCredentials => prepareWalkthroughNamespace(dispatch, walkthroughs.one, amqCredentials),
  prepareWalkthroughOneA: enmasseCredentials =>
    prepareWalkthroughNamespace(dispatch, walkthroughs.oneA, enmasseCredentials),
  setProgress: progress => dispatch(reduxActions.userActions.setProgress(progress))
});

const mapStateToProps = state => ({
  ...state.threadReducers,
  ...state.middlewareReducers,
  ...state.userReducers,
  ...state.walkthroughServiceReducers
});

const ConnectedTaskPage = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(translate()(TaskPage))
);

export { ConnectedTaskPage as default, ConnectedTaskPage, TaskPage };
