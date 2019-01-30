import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { noop, Button, ButtonGroup, Grid, Icon, Radio } from 'patternfly-react';
import { connect, reduxActions } from '../../../redux';
import Breadcrumb from '../../../components/breadcrumb/breadcrumb';
import LoadingScreen from '../../../components/loadingScreen/loadingScreen';
import ErrorScreen from '../../../components/errorScreen/errorScreen';
import PfMasthead from '../../../components/masthead/masthead';
import WalkthroughResources from '../../../components/walkthroughResources/walkthroughResources';
import { prepareCustomWalkthroughNamespace } from '../../../services/walkthroughServices';
import { getThreadProgress } from '../../../services/threadServices';
import { getDocsForWalkthrough, getDefaultAdocAttrs } from '../../../common/docsHelpers';
import {
  parseWalkthroughAdoc,
  WalkthroughVerificationBlock,
  WalkthroughTextBlock,
  WalkthroughStep
} from '../../../common/walkthroughHelpers';
import CopyField from '../../../components/copyField/copyField';

class TaskPage extends React.Component {
  constructor(props) {
    super(props);
    this.rootDiv = React.createRef();
  }

  componentDidUpdate() {
    if (this.rootDiv.current) {
      const codeBlocks = this.rootDiv.current.querySelectorAll('pre');
      codeBlocks.forEach(block => {
        ReactDOM.render(<CopyField value={block.innerText} multiline={block.clientHeight > 40} />, block.parentNode);
      });
    }
  }

  componentDidMount() {
    const {
      getWalkthrough,
      prepareCustomWalkthrough,
      updateWalkthroughProgress,
      match: {
        params: { id }
      }
    } = this.props;

    this.rootDiv = React.createRef();

    getWalkthrough(id);
    prepareCustomWalkthrough(id, this.getDocsAttributes(id));
    const currentUsername = localStorage.getItem('currentUserName');
    const currentUserProgress = getThreadProgress(currentUsername);
    updateWalkthroughProgress(currentUsername, currentUserProgress);
  }

  getStoredProgressForCurrentTask = () => {
    const {
      threadProgress: { data },
      match: {
        params: { id, task }
      }
    } = this.props;
    if (!data || !data[id] || !data[id][task]) {
      return {};
    }
    return data[id][task];
  };

  updateStoredProgressForCurrentTask = verificationState => {
    const {
      updateWalkthroughProgress,
      threadProgress,
      thread: { data },
      match: {
        params: { id, task }
      }
    } = this.props;
    const currentUsername = window.localStorage.getItem('currentUserName');
    const oldProgress = Object.assign({}, threadProgress.data || {});
    if (!oldProgress[id]) {
      oldProgress[id] = {};
    }
    if (!oldProgress[id][task]) {
      oldProgress[id][task] = {};
    }
    const newCurrentProgress = Object.assign({}, oldProgress[id][task] || {}, verificationState);
    oldProgress[id][task] = newCurrentProgress;

    // Update progress if the walkthrough has at least one step
    const totalSteps = this.getTotalSteps(data);
    if (totalSteps > 0) {
      const completedSteps = this.getCompletedSteps(oldProgress[id]);
      oldProgress[id].progress = Math.floor((completedSteps / totalSteps) * 100);
      oldProgress[id].task = task;
    }

    updateWalkthroughProgress(currentUsername, oldProgress);
  };

  getVerificationsForTask = task => {
    if (!task || !task.blocks) {
      return [];
    }
    return task.blocks.reduce((acc, b, i) => {
      if (b instanceof WalkthroughStep) {
        return acc.concat(this.getVerificationsForStep(i, b));
      }
      if (b instanceof WalkthroughVerificationBlock) {
        return acc.concat(`${i}`);
      }
      return acc;
    }, []);
  };

  getVerificationsForStep = (stepId, step) => {
    if (!step.blocks) {
      return [];
    }
    const verificationIds = [];
    step.blocks.forEach((block, i) => {
      if (block instanceof WalkthroughVerificationBlock) {
        verificationIds.push(`${stepId}-${i}`);
      }
    });
    return verificationIds;
  };

  // Returns the total steps that a walkthrough has. The number of steps is defined by the
  // number of verifications it has. Because we only parse the actual walkthrough in render
  // we have to rely on a regular expression to get the number of verification annotations
  getTotalSteps = data => (data.match(/\[type=verification]/g) || []).length;

  // Iterates through the threadProgress object and count every `true` value on every task
  getCompletedSteps = threadProgress => {
    // We need to filter `progress` and `task` because they are appended to the same object
    const stepProgress = Object.keys(threadProgress).filter(s => s !== 'progress' && s !== 'task');
    return stepProgress.reduce((acc, step) => {
      const successfulVerifications = Object.values(threadProgress[step]).filter(s => s).length;
      return acc + successfulVerifications;
    }, 0);
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

  resourcesProgress = () => {
    let progress = 0;

    if (!this.props.thread.pending) {
      progress += 50;
    }

    if (!this.props.manifest.pending) {
      progress += 50;
    }

    return progress;
  };

  totalLoadingProgress = attrs => Math.ceil((this.resourcesProgress() + this.docsAttributesProgress(attrs)) / 2);

  // Temporary fix for the Asciidoc renderer not being reactive.
  getDocsAttributes = walkthroughId =>
    getDocsForWalkthrough(walkthroughId, this.props.middlewareServices, this.props.walkthroughResources);

  getAMQCredential = (middlewareServices, name) => {
    if (!middlewareServices || !middlewareServices.amqCredentials || !middlewareServices.amqCredentials[name]) {
      return null;
    }
    return middlewareServices.amqCredentials[name];
  };

  backToIntro = e => {
    e.preventDefault();
    const {
      history,
      match: {
        params: { id }
      }
    } = this.props;
    history.push(`/tutorial/${id}`);
  };

  goToTask = (e, next) => {
    e.preventDefault();
    const {
      history,
      match: {
        params: { id }
      }
    } = this.props;
    history.push(`/tutorial/${id}/task/${next}`);
  };

  exitTutorial = e => {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/congratulations/${this.props.thread.data.id}`);
  };

  handleVerificationInput = (e, id, isSuccess) => {
    const o = Object.assign({}, this.getStoredProgressForCurrentTask());
    o[id] = isSuccess;
    this.updateStoredProgressForCurrentTask(o);
  };

  taskVerificationStatus = (verifications, idsToVerify) => {
    if (!idsToVerify || idsToVerify.length === 0) {
      return true;
    }
    for (const verificationId of idsToVerify) {
      if (!verifications[verificationId]) {
        return false;
      }
    }
    return true;
  };

  renderVerificationBlock(blockId, block) {
    const { t } = this.props;
    const currentThreadProgress = this.getStoredProgressForCurrentTask();
    const isNoChecked = currentThreadProgress[blockId] !== undefined && !currentThreadProgress[blockId];
    const isYesChecked = currentThreadProgress[blockId] !== undefined && !!currentThreadProgress[blockId];

    let verificationClasses = 'alert integr8ly-alert integr8ly-module-column--steps_alert-blue';
    let verificationIcon = 'integr8ly-alert-icon far fa-circle';
    if (isYesChecked) {
      verificationClasses = 'alert integr8ly-alert integr8ly-module-column--steps_alert-green';
      verificationIcon = 'integr8ly-alert-icon far fa-check-circle';
    }
    if (isNoChecked) {
      verificationClasses = 'alert integr8ly-alert integr8ly-module-column--steps_alert-red';
      verificationIcon = 'integr8ly-alert-icon far fa-times-circle';
    }
    return (
      <div className={verificationClasses} key={`verification-${blockId}`}>
        <i className={verificationIcon} />
        <strong>{t('task.verificationTitle')}</strong>
        <div dangerouslySetInnerHTML={{ __html: block.html }} />
        {
          <React.Fragment>
            <Radio
              name={blockId}
              checked={isYesChecked}
              onChange={e => {
                this.handleVerificationInput(e, blockId, true);
              }}
            >
              Yes
            </Radio>
            <Radio
              name={blockId}
              checked={isNoChecked}
              onChange={e => {
                this.handleVerificationInput(e, blockId, false);
              }}
            >
              No
            </Radio>
            {isNoChecked && block.hasFailBlock && <div dangerouslySetInnerHTML={{ __html: block.failBlock.html }} />}
            {isYesChecked &&
              block.hasSuccessBlock && <div dangerouslySetInnerHTML={{ __html: block.successBlock.html }} />}
          </React.Fragment>
        }
      </div>
    );
  }

  renderStepBlock(id, block) {
    if (block instanceof WalkthroughTextBlock) {
      return (
        <React.Fragment key={id}>
          <div dangerouslySetInnerHTML={{ __html: block.html }} />
        </React.Fragment>
      );
    }
    if (block instanceof WalkthroughVerificationBlock) {
      return this.renderVerificationBlock(`${id}`, block);
    }
    if (block instanceof WalkthroughStep) {
      return (
        <React.Fragment key={id}>
          <h3>{block.title}</h3>
          {block.blocks.map((b, i) => (
            <React.Fragment key={`${id}-${i}`}>
              {b instanceof WalkthroughTextBlock && <div dangerouslySetInnerHTML={{ __html: b.html }} />}
              {b instanceof WalkthroughVerificationBlock && this.renderVerificationBlock(`${id}-${i}`, b)}
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    }
    return null;
  }

  render() {
    const {
      match: {
        params: { id, task }
      }
    } = this.props;
    const attrs = this.getDocsAttributes(id);
    const { t, thread, manifest } = this.props;

    if (thread.pending || manifest.pending) {
      return (
        <LoadingScreen
          loadingText="We're initiating services and dependencies for your walkthrough"
          standbyText=" Please stand by."
          progress={!window.OPENSHIFT_CONFIG.mockData ? this.totalLoadingProgress(attrs) : 100}
        />
      );
    }
    if (thread.error || manifest.error) {
      return (
        <div>
          <PfMasthead />
          <ErrorScreen errorText={thread.errorMessage || manifest.errorMessage} />
        </div>
      );
    }
    if (thread.fulfilled && thread.data) {
      const taskNum = parseInt(task, 10);
      const parsedAttrs = Object.assign({}, getDefaultAdocAttrs(id), attrs);
      const parsedThread = parseWalkthroughAdoc(thread.data, parsedAttrs);
      const threadTask = parsedThread.tasks[taskNum];
      const totalTasks = parsedThread.tasks.filter(parsedTask => !parsedTask.isVerification).length;
      const taskVerificationComplete = this.taskVerificationStatus(
        this.getStoredProgressForCurrentTask(),
        this.getVerificationsForTask(threadTask)
      );

      const currentThreadProgress = this.getStoredProgressForCurrentTask();
      const combinedResources = parsedThread.resources.concat(threadTask.resources);
      return (
        <React.Fragment>
          <Breadcrumb
            threadName={parsedThread.title}
            threadId={id}
            taskPosition={taskNum + 1}
            totalTasks={totalTasks}
            homeClickedCallback={() => {}}
          />
          <Grid fluid>
            <Grid.Row>
              <Grid.Col xs={12} sm={9} className="integr8ly-module">
                <div className="integr8ly-module-column">
                  <h2>{threadTask.title}</h2>
                  <div className="integr8ly-module-column--steps" ref={this.rootDiv}>
                    {threadTask.steps.map((step, i) => this.renderStepBlock(i, step))}
                  </div>

                  {/* Bottom footer */}
                  <div className="integr8ly-module-column--footer">
                    <h6>{t('task.CompleteAndCheck')}</h6>
                    <div className="integr8ly-module-column--footer_status">
                      {this.getVerificationsForTask(threadTask).map((verificationId, i) => (
                        <React.Fragment key={i}>
                          {/* Bottom footer icon */}
                          {currentThreadProgress[verificationId] === undefined ? (
                            <Icon
                              type="fa"
                              className="far integr8ly-module-column--footer_status"
                              key={`verification-icon-${verificationId}`}
                              name="circle"
                            />
                          ) : (
                            <Icon
                              type="fa"
                              className={
                                currentThreadProgress[verificationId]
                                  ? 'far integr8ly-module-column--footer_status-checked'
                                  : 'far integr8ly-module-column--footer_status-unchecked'
                              }
                              key={`verification-icon-${verificationId}`}
                              name={currentThreadProgress[verificationId] ? 'check-circle' : 'times-circle'}
                            />
                          )}
                          {/* Bottom footer number to the right of icon  */}
                          {currentThreadProgress[verificationId] === undefined ? (
                            <span
                              className="integr8ly-module-column--footer_status"
                              key={`verification-id-${verificationId}`}
                            >
                              {threadTask.steps.length === 1
                                ? parseInt(task, 10) + 1
                                : `${parseInt(task, 10) + 1}.${parseInt(i, 10) + 1}`}
                            </span>
                          ) : (
                            <span
                              className={
                                currentThreadProgress[verificationId]
                                  ? 'integr8ly-module-column--footer_status-checked'
                                  : 'integr8ly-module-column--footer_status-unchecked'
                              }
                              key={`verification-id-${verificationId}`}
                            >
                              {threadTask.steps.length === 1
                                ? parseInt(task, 10) + 1
                                : `${parseInt(task, 10) + 1}.${parseInt(i, 10) + 1}`}
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <div
                      className="btn-group btn-group-justified"
                      role="group"
                      aria-label="module step progress buttons"
                    >
                      {taskNum === 0 && (
                        <ButtonGroup>
                          <Button onClick={e => this.backToIntro(e)}>
                            <Icon type="fa" name="angle-left" style={{ paddingRight: 5 }} />
                            {t('task.backToIntro')}
                          </Button>
                        </ButtonGroup>
                      )}
                      {taskNum > 0 && (
                        <ButtonGroup>
                          <Button onClick={e => this.goToTask(e, taskNum - 1)}>
                            <Icon type="fa" name="angle-left" style={{ paddingRight: 5 }} />
                            {t('task.previousTask')}
                          </Button>
                        </ButtonGroup>
                      )}
                      {taskNum + 1 < totalTasks && (
                        <ButtonGroup>
                          <Button
                            bsStyle={taskVerificationComplete ? 'primary' : 'default'}
                            onClick={e => this.goToTask(e, taskNum + 1)}
                            disabled={!taskVerificationComplete}
                          >
                            {t('task.nextTask')} <Icon type="fa" name="angle-right" style={{ paddingLeft: 5 }} />
                          </Button>
                        </ButtonGroup>
                      )}
                      {taskNum + 1 === totalTasks && (
                        <ButtonGroup>
                          <Button
                            bsStyle={taskVerificationComplete ? 'primary' : 'default'}
                            onClick={e => this.exitTutorial(e)}
                            disabled={!taskVerificationComplete}
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
                <WalkthroughResources resources={combinedResources} />
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
  // i18n: PropTypes.object,
  t: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }),
  match: PropTypes.shape({
    params: PropTypes.object
  }),
  middlewareServices: PropTypes.object,
  thread: PropTypes.object,
  manifest: PropTypes.object,
  // user: PropTypes.object,
  getWalkthrough: PropTypes.func,
  prepareCustomWalkthrough: PropTypes.func,
  updateWalkthroughProgress: PropTypes.func,
  threadProgress: PropTypes.object,
  walkthroughResources: PropTypes.object
};

TaskPage.defaultProps = {
  // i18n: {
  //   language: 'en'
  // },
  history: {
    push: noop
  },
  match: {
    params: {}
  },
  middlewareServices: {
    data: {},
    amqCredentials: {},
    enmasseCredentials: {}
  },
  prepareCustomWalkthrough: noop,
  thread: null,
  manifest: null,
  // user: null,
  getWalkthrough: noop,
  updateWalkthroughProgress: noop,
  threadProgress: { data: {} },
  walkthroughResources: {}
};

const mapDispatchToProps = dispatch => ({
  getThread: (language, id) => dispatch(reduxActions.threadActions.getThread(language, id)),
  getProgress: () => dispatch(reduxActions.userActions.getProgress()),
  prepareCustomWalkthrough: (id, attrs) => prepareCustomWalkthroughNamespace(dispatch, id, attrs),
  setProgress: progress => dispatch(reduxActions.userActions.setProgress(progress)),
  getWalkthrough: id => dispatch(reduxActions.threadActions.getCustomThread(id)),
  updateWalkthroughProgress: (username, progress) =>
    dispatch(reduxActions.threadActions.updateThreadProgress(username, progress))
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
