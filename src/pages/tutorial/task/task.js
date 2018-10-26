import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { noop, Alert, Button, ButtonGroup, Grid, Icon, Radio } from 'patternfly-react';
import { connect, reduxActions } from '../../../redux';
import Breadcrumb from '../../../components/breadcrumb/breadcrumb';
import LoadingScreen from '../../../components/loadingScreen/loadingScreen';
import ErrorScreen from '../../../components/errorScreen/errorScreen';
import PfMasthead from '../../../components/masthead/masthead';
import AsciiDocTemplate from '../../../components/asciiDocTemplate/asciiDocTemplate';
import WalkthroughResources from '../../../components/walkthroughResources/walkthroughResources';
import { prepareWalkthroughNamespace, walkthroughs, WALKTHROUGH_IDS } from '../../../services/walkthroughServices';
import { buildNamespacedServiceInstanceName } from '../../../common/openshiftHelpers';
import { getDocsForWalkthrough } from '../../../common/docsHelpers';

class TaskPage extends React.Component {
  state = { task: 0, verifications: {}, verificationsChecked: false };

  componentDidMount() {
    this.loadThread();
    const { prepareWalkthroughOne, prepareWalkthroughOneA, prepareWalkthroughTwo } = this.props;
    if (this.props.match.params.id === WALKTHROUGH_IDS.ONE) {
      prepareWalkthroughOne(this.props.middlewareServices.amqCredentials);
    }
    if (this.props.match.params.id === WALKTHROUGH_IDS.ONE_A) {
      prepareWalkthroughOneA(this.props.middlewareServices.enmasseCredentials);
    }
    if (this.props.match.params.id === WALKTHROUGH_IDS.TWO) {
      prepareWalkthroughTwo();
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
      getProgress,
      getThread,
      user
    } = this.props;
    if (!Number.isNaN(id)) {
      const parsedTask = parseInt(task, 10);
      this.setState({ id, task: parsedTask });
      getProgress();
      getThread(i18n.language, id).then(thread => {
        const verifications = {};
        const threadTask = thread.value.data.tasks[parsedTask];
        const currentProgress = user.userProgress.threads.find(thd => thd.threadId === thread.value.data.id.toString());

        threadTask.steps.forEach(step => {
          if (step.infoVerifications) {
            step.infoVerifications.forEach(verification => {
              verifications[verification] = undefined;
            });
          } else if (step.successVerifications) {
            step.successVerifications.forEach(verification => {
              verifications[verification] = false;
            });
          }
        });

        const hasVerifications = Object.keys(verifications).length > 0;
        if (currentProgress && currentProgress.threadStepsVerified && hasVerifications) {
          for (const property in verifications) {
            if (verifications.hasOwnProperty(property) && currentProgress.threadStepsVerified[parsedTask.toString()]) {
              verifications[property] = currentProgress.threadStepsVerified[parsedTask.toString()][property];
            }
          }
        }

        this.setState({
          verifications,
          verificationsChecked: Object.values(verifications).every(v => v === true)
        });
      });
    }
  }

  getTotalSteps = tasks => {
    let totalSteps = 0;
    tasks.forEach(task => {
      task.steps.forEach(step => {
        if (step.infoVerifications) {
          totalSteps++;
        }
      });
    });
    return totalSteps;
  };

  updateThreadState = () => {
    const { thread, setProgress, user } = this.props;
    const { task } = this.state;
    const threadProgress = {
      threadId: thread.data.id.toString(),
      threadStepsVerified: this.state.verifications,
      totalTasks: thread.data.tasks.length,
      totalSteps: this.getTotalSteps(thread.data.tasks)
    };

    // Get the previous steps verified and the new steps verified.
    const currentProgress = user.userProgress.threads.find(thd => thd.threadId === thread.data.id.toString());
    if (currentProgress !== undefined) {
      threadProgress.threadStepsVerified = currentProgress.threadStepsVerified;
      threadProgress.threadStepsVerified[this.state.task] = this.state.verifications;
    } else {
      threadProgress.threadStepsVerified = {};
      threadProgress.threadStepsVerified[this.state.task] = this.state.verifications;
    }

    let stepsCompleted = 0;
    // Calculate how many steps have been completed.
    for (const threadProperty in threadProgress.threadStepsVerified) {
      if (threadProgress.threadStepsVerified.hasOwnProperty(threadProperty)) {
        for (const stepProperty in threadProgress.threadStepsVerified[threadProperty]) {
          if (
            threadProgress.threadStepsVerified[threadProperty].hasOwnProperty(stepProperty) &&
            threadProgress.threadStepsVerified[threadProperty][stepProperty] === true
          ) {
            stepsCompleted++;
          }
        }
      }
    }

    // Check if this task is completed.
    let lastTaskCompleted = task;
    for (const step in this.state.verifications) {
      if (this.state.verifications[step] === undefined || this.state.verifications[step] === false) {
        lastTaskCompleted = task === 0 ? 0 : task - 1;
        break;
      }
    }

    threadProgress.task = lastTaskCompleted;
    threadProgress.progress = Math.round((stepsCompleted / threadProgress.totalSteps) * 100);
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

  docsAttributesProgress = attrs => {
    let found = 0;
    const requirements = {
      '1': ['spring-boot-url', 'node-js-url'],
      '1A': ['spring-boot-url', 'node-js-url']
    };
    if (!(attrs['walkthrough-id'] in requirements)) {
      return 100;
    }
    for (let i = 0; i < requirements[attrs['walkthrough-id']].length; i++) {
      if (attrs[requirements[attrs['walkthrough-id']][i]] !== null) {
        found++;
      }
    }
    if (found === requirements[attrs['walkthrough-id']].length) {
      return 100;
    }
    if (found === 0) {
      return 0;
    }
    return 100 * (found / requirements[attrs['walkthrough-id']].length);
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

  handleYesVerification = (e, verification) => {
    const o = Object.assign({}, this.state.verifications);
    o[verification] = e.target.checked;
    const verificationsChecked = Object.values(o).every(v => v === true);
    this.setState({ verifications: o, verificationsChecked });
  };

  handleNoVerification = (e, verification) => {
    const o = Object.assign({}, this.state.verifications);
    o[verification] = !e.target.checked;
    const verificationsChecked = Object.values(o).every(v => v === true);
    this.setState({ verifications: o, verificationsChecked });
  };

  render() {
    const attrs = this.getDocsAttributes();
    const { t, thread } = this.props;
    const { task, verifications, verificationsChecked } = this.state;

    if (thread.pending) {
      // todo: loading state
      return null;
    }

    if (thread.error) {
      return (
        <div>
          <PfMasthead />
          <ErrorScreen />
        </div>
      );
    }

    if (thread.fulfilled && thread.data) {
      const threadTask = thread.data.tasks[task];
      const totalTasks = thread.data.tasks.length;
      const loadingText = `We're initiating services for "${thread.data.title}".`;
      const standbyText = 'Please stand by.';
      return (
        <React.Fragment>
          <Breadcrumb
            threadName={thread.data.title}
            threadId={thread.data.id.parseInt}
            taskPosition={task + 1}
            totalTasks={totalTasks}
            homeClickedCallback={() => {
              this.updateThreadState();
            }}
          />
          <Grid fluid>
            <LoadingScreen
              loadingText={loadingText}
              standbyText={standbyText}
              progress={!window.OPENSHIFT_CONFIG.mockData ? this.docsAttributesProgress(attrs) : 100}
            />
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
                            thread.data.attributes,
                            step.attributes,
                            this.getDocsAttributes()
                          )}
                        />

                        {/* for Yes/No implementation */}
                        {step.infoVerifications &&
                          step.infoVerifications.map(
                            (verification, j) =>
                              verifications[step.infoVerifications[0]] === undefined ? (
                                <div className="alert integr8ly-module-column--steps_alert-blue" key={j}>
                                  <i className="pficon fa fa-circle-o" />
                                  <strong>{t('task.verificationTitle')}</strong>
                                  <AsciiDocTemplate
                                    adoc={verification}
                                    attributes={Object.assign(
                                      {},
                                      thread.data.attributes,
                                      step.attributes,
                                      this.getDocsAttributes()
                                    )}
                                  />
                                  <ButtonGroup>
                                    <Radio
                                      name={step.stepDoc}
                                      onChange={e => {
                                        this.handleYesVerification(e, verification);
                                      }}
                                    >
                                      Yes
                                    </Radio>
                                    <Radio
                                      name={step.stepDoc}
                                      onChange={e => {
                                        this.handleNoVerification(e, verification);
                                      }}
                                    >
                                      No
                                    </Radio>
                                  </ButtonGroup>
                                </div>
                              ) : (
                                <Alert
                                  type={
                                    step.infoVerifications && verifications[step.infoVerifications[0]]
                                      ? 'success'
                                      : 'error'
                                  }
                                  className="alert alert-default"
                                  key={j}
                                >
                                  <strong>{t('task.verificationTitle')}</strong>
                                  <AsciiDocTemplate
                                    adoc={verification}
                                    attributes={Object.assign(
                                      {},
                                      thread.data.attributes,
                                      step.attributes,
                                      this.getDocsAttributes()
                                    )}
                                  />
                                  <ButtonGroup>
                                    <Radio
                                      checked={
                                        step.infoVerifications && verifications[step.infoVerifications[0]]
                                          ? 'checked'
                                          : ''
                                      }
                                      name={step.stepDoc}
                                      onChange={e => {
                                        this.handleYesVerification(e, verification);
                                      }}
                                    >
                                      Yes
                                    </Radio>
                                    <Radio
                                      checked={
                                        step.infoVerifications && verifications[step.infoVerifications[0]]
                                          ? ''
                                          : 'checked'
                                      }
                                      name={step.stepDoc}
                                      onChange={e => {
                                        this.handleNoVerification(e, verification);
                                      }}
                                    >
                                      No
                                    </Radio>
                                  </ButtonGroup>
                                  <span
                                    className={
                                      step.infoVerifications && verifications[step.infoVerifications[0]]
                                        ? 'hidden'
                                        : 'show'
                                    }
                                  >
                                    <AsciiDocTemplate
                                      adoc={step.infoVerificationsNo ? step.infoVerificationsNo[0] : null}
                                      attributes={Object.assign(
                                        {},
                                        thread.data.attributes,
                                        step.attributes,
                                        this.getDocsAttributes()
                                      )}
                                    />
                                  </span>
                                </Alert>
                              )
                          )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Bottom footer */}
                  <div className="integr8ly-module-column--footer">
                    <h6>{t('task.CompleteAndCheck')}</h6>
                    <div className="integr8ly-module-column--footer_status">
                      {threadTask.steps.map((step, l) => (
                        <React.Fragment key={l}>
                          {/* Bottom footer icon */}
                          {step.infoVerifications &&
                            step.infoVerifications.map(
                              (verification, v) =>
                                verifications[step.infoVerifications[0]] === undefined ? (
                                  <Icon
                                    type="fa"
                                    className="integr8ly-module-column--footer_status"
                                    key={v}
                                    name="circle-o"
                                  />
                                ) : (
                                  <Icon
                                    type="fa"
                                    className={
                                      step.infoVerifications && verifications[step.infoVerifications[0]]
                                        ? 'integr8ly-module-column--footer_status-checked'
                                        : 'integr8ly-module-column--footer_status-unchecked'
                                    }
                                    key={v}
                                    name={
                                      verifications[step.infoVerifications[0]] ? 'check-circle-o' : 'times-circle-o'
                                    }
                                  />
                                )
                            )}
                          {/* Bottom footer number to the right of icon  */}
                          {step.infoVerifications &&
                            step.infoVerifications.map(
                              (verification, v) =>
                                verifications[step.infoVerifications[0]] === undefined ? (
                                  <span className="integr8ly-module-column--footer_status" key={v}>
                                    {task + 1}.{l + 1}
                                  </span>
                                ) : (
                                  <span
                                    className={
                                      verifications[step.infoVerifications[0]]
                                        ? 'integr8ly-module-column--footer_status-checked'
                                        : 'integr8ly-module-column--footer_status-unchecked'
                                    }
                                    key={v}
                                  >
                                    {task + 1}.{l + 1}
                                  </span>
                                )
                            )}
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
                          <Button
                            bsStyle={verificationsChecked ? 'primary' : 'default'}
                            onClick={e => this.exitTutorial(e)}
                            disabled={!verificationsChecked}
                          >
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
                <WalkthroughResources resources={thread.data.resources} />
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
  getProgress: PropTypes.func,
  prepareWalkthroughTwo: PropTypes.func,
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
  getProgress: noop,
  prepareWalkthroughTwo: noop,
  setProgress: noop,
  thread: null,
  user: null
};

const mapDispatchToProps = dispatch => ({
  getThread: (language, id) => dispatch(reduxActions.threadActions.getThread(language, id)),
  prepareWalkthroughOne: amqCredentials => prepareWalkthroughNamespace(dispatch, walkthroughs.one, amqCredentials),
  prepareWalkthroughOneA: enmasseCredentials =>
    prepareWalkthroughNamespace(dispatch, walkthroughs.oneA, enmasseCredentials),
  getProgress: progress => dispatch(reduxActions.userActions.getProgress()),
  prepareWalkthroughTwo: () => prepareWalkthroughNamespace(dispatch, walkthroughs.two, null),
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
