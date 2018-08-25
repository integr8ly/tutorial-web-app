import React from 'react';
import PropTypes from 'prop-types';
import Iframe from 'react-iframe';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { noop, Alert, Button, ButtonGroup, Grid, Icon, ProgressBar } from 'patternfly-react';
import { connect, reduxActions } from '../../../redux';
import Breadcrumb from '../../../components/breadcrumb/breadcrumb';
import AsciiDocTemplate from '../../../components/asciiDocTemplate/asciiDocTemplate';

class ModulePage extends React.Component {
  state = { module: 0, step: 0 };

  componentDidMount() {
    this.loadThread();
  }

  componentDidUpdate() {
    const {
      match: {
        params: { id, module, step }
      }
    } = this.props;
    if (!Number.isNaN(id)) {
      const parsedModule = parseInt(module, 10);
      const parsedStep = step ? parseInt(step, 10) : 0;
      if (id !== this.state.id || parsedModule !== this.state.module || parsedStep !== this.state.step) {
        this.loadThread();
      }
    }
  }

  loadThread() {
    const {
      match: {
        params: { id, module, step }
      },
      getThread
    } = this.props;
    if (!Number.isNaN(id)) {
      getThread(id);
      const parsedModule = parseInt(module, 10);
      const parsedStep = step ? parseInt(step, 10) : 0;
      this.setState({ id, module: parsedModule, step: parsedStep });
    }
  }

  goToModule = (e, next) => {
    e.preventDefault();
    const { history } = this.props;
    const { id } = this.state;
    history.push(`/tutorial/${id}/module/${next}`);
  };

  exitTutorial = e => {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/`);
  };

  render() {
    const { t, thread } = this.props;
    const { module, step } = this.state;
    if (thread.pending) {
      // todo: loading state
      return null;
    }
    if (thread.error) {
      // todo: error state
      return null;
    }
    if (thread.fulfilled && thread.data) {
      const threadModule = thread.data.modules[module];
      const totalModules = thread.data.modules.length;
      const progess = Math.round((module / (totalModules - 1)) * 100);

      // do not activate the step until link is clicked and we have a step url param
      const activeStep = step > 0 ? threadModule.steps[step - 1] : null;
      return (
        <React.Fragment>
          <Breadcrumb
            threadName={thread.data.title}
            threadId={thread.data.id}
            modulePosition={module + 1}
            totalModules={totalModules}
          />
          <Grid fluid>
            <Grid.Row>
              <Grid.Col sm={3} className="integr8ly-module">
                <div className="integr8ly-module-column">
                  <div className="integr8ly-module-column--status">
                    <h4>{threadModule.title}</h4>
                    <ProgressBar className="progress progress-sm" now={progess} />
                  </div>
                  <div className="integr8ly-module-column--steps">
                    {threadModule.steps.map((s, i) => (
                      <React.Fragment key={i}>
                        <AsciiDocTemplate template={s.stepDoc} />
                        {s.stepDocInfo && (
                          <Alert type="info">
                            <AsciiDocTemplate template={s.stepDocInfo} />
                          </Alert>
                        )}
                        {s.stepDocSuccess && (
                          <Alert type="success">
                            <AsciiDocTemplate template={s.stepDocSuccess} />
                          </Alert>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="integr8ly-module-column--footer">
                    <h4>{t('module.whatsNext')}</h4>
                    <p>{t('module.completeModuleFirst')}</p>
                    <div
                      className="btn-group btn-group-justified"
                      role="group"
                      aria-label="module step progress buttons"
                    >
                      {module > 0 && (
                        <ButtonGroup>
                          <Button onClick={e => this.goToModule(e, module - 1)}>
                            <Icon type="fa" name="angle-left" style={{ paddingRight: 5 }} />
                            {t('module.previousModule')}
                          </Button>
                        </ButtonGroup>
                      )}
                      {module + 1 < totalModules && (
                        <ButtonGroup>
                          <Button onClick={e => this.goToModule(e, module + 1)}>
                            {t('module.nextModule')} <Icon type="fa" name="angle-right" style={{ paddingLeft: 5 }} />
                          </Button>
                        </ButtonGroup>
                      )}
                      {module + 1 === totalModules && (
                        <ButtonGroup>
                          <Button onClick={e => this.exitTutorial(e)}>
                            {t('module.exitTutorial')} <Icon type="fa" name="angle-right" style={{ paddingLeft: 5 }} />
                          </Button>
                        </ButtonGroup>
                      )}
                    </div>
                  </div>
                </div>
              </Grid.Col>
              <Grid.Col sm={9} className="integr8ly-frame">
                <Iframe
                  url={activeStep ? activeStep.iframeUrl : threadModule.iframeUrl}
                  styles={{ width: '96%', height: '100%' }}
                />
              </Grid.Col>
            </Grid.Row>
          </Grid>
        </React.Fragment>
      );
    }
    return null;
  }
}

ModulePage.propTypes = {
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

ModulePage.defaultProps = {
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

const ConnectedModulePage = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(translate()(ModulePage))
);

export { ConnectedModulePage as default, ConnectedModulePage, ModulePage };
