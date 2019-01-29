import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { noop, Button, Icon, ListView } from 'patternfly-react';
import { Grid, GridItem, Page, PageSection, PageSectionVariants } from '@patternfly/react-core';
import PfMasthead from '../../components/masthead/masthead';
import WalkthroughResources from '../../components/walkthroughResources/walkthroughResources';
import { connect, reduxActions } from '../../redux';
import { parseWalkthroughAdoc } from '../../common/walkthroughHelpers';
import { getDocsForWalkthrough, getDefaultAdocAttrs } from '../../common/docsHelpers';

class TutorialPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDropdownOpen: false
    };
  }

  onDropdownToggle = isDropdownOpen => {
    this.setState({
      isDropdownOpen
    });
  };

  onDropdownSelect = event => {
    this.setState({
      isDropdownOpen: !this.state.isDropdownOpen
    });
  };

  onLogoutUser = () => {
    if (window.OPENSHIFT_CONFIG.mockData) {
      window.localStorage.clear();
      window.location.href = window.OPENSHIFT_CONFIG.ssoLogoutUri;
      return;
    }
    logout().then(() => {
      window.location.href = window.OPENSHIFT_CONFIG.ssoLogoutUri;
    });
  };

  onTitleClick = () => {
    const { history } = this.props;
    history.push(`/`);
  };

  componentDidMount() {
    const {
      getWalkthrough,
      getProgress,
      match: {
        params: { id }
      }
    } = this.props;
    getWalkthrough(id);
    getProgress();
  }

  getStarted(e, id) {
    e.preventDefault();
    const {
      user: { userProgress = {} },
      history
    } = this.props;
    let currentTask = 0;
    if (userProgress[id] && userProgress[id].task) {
      currentTask = userProgress[id].task;
    }
    history.push(`/tutorial/${id}/task/${currentTask}`);
  }

  renderPrereqs(thread) {
    const { t } = this.props;
    const { data } = thread;
    if (!data.prerequisites || data.prerequisites.length === 0) {
      return null;
    }

    return (
      <div className="alert alert-info" style={{ marginTop: 10 }}>
        <h3 className="integr8ly-tutorial-prereqs">{t('tutorial.prereq')}</h3>
        <ul className="fa-ul">
          {data.prerequisites.map((req, i) => (
            <li key={i}>
              <i className="fa-li fa fa-check-square" />
              {req}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  render() {
    const {
      t,
      thread,
      match: {
        params: { id }
      }
    } = this.props;
    if (thread.pending) {
      // todo: loading state
      return null;
    }
    if (thread.error) {
      // todo: error state
      return null;
    }

    if (thread.fulfilled && thread.data) {
      const attrs = getDocsForWalkthrough(id, this.props.middlewareServices, this.props.walkthroughResources);
      const parsedAttrs = Object.assign({}, getDefaultAdocAttrs(id), attrs);
      const parsedThread = parseWalkthroughAdoc(thread.data, parsedAttrs);
      return (
        <React.Fragment>
          <Page>
            <PfMasthead />
            <PageSection
              variant={PageSectionVariants.light}
              className="integr8ly-landing-page-tutorial-dashboard-section pf-u-p-0"
            >
              <Grid gutter="md" className="pf-c-content">
                <GridItem sm={12} md={9} className="integr8ly-task-container pf-u-pt-xl pf-u-px-lg">
                  <div className="integr8ly-task-dashboard-header">
                    <h3>{parsedThread.title}</h3>
                    <Button bsStyle="primary" onClick={e => this.getStarted(e, id)}>
                      {t('tutorial.getStarted')}
                    </Button>
                  </div>
                  {this.renderPrereqs(thread)}
                  <div dangerouslySetInnerHTML={{ __html: parsedThread.preamble }} />
                  {/* <AsciiDocTemplate
                    adoc={thread}
                    attributes={Object.assign({}, thread.data.attributes)}
                  /> */}
                </GridItem>
                <GridItem md={3} rowSpan={2} className="integr8ly-module-frame pf-u-pt-xl pf-u-px-lg">
                  {/* <h4 className="integr8ly-helpful-links-heading">Walkthrough Diagram</h4>
                  <img src="/images/st0.png" className="img-responsive" alt="integration" /> */}
                  <WalkthroughResources resources={parsedThread.resources} />
                </GridItem>
                <GridItem sm={12} md={9} className="pf-u-px-lg">
                  <h3 className="pf-u-mt-xl">
                    {t('tutorial.tasksToComplete')}
                    <div className="pull-right integr8ly-task-dashboard-time-to-completion">
                      <Icon type="fa" name="clock" style={{ marginRight: 5 }} />
                      <span>
                        {parsedThread.time}
                        <span className="integr8ly-task-dashboard-time-to-completion_minutes">
                          {t('tutorial.minutes')}
                        </span>
                      </span>
                    </div>
                  </h3>
                  <ListView className="integr8ly-list-view-pf">
                    {parsedThread.tasks.map((task, i) => (
                      <ListView.Item
                        key={i}
                        heading={`${task.title}`}
                        description={task.shortDescription}
                        actions={
                          <div className="integr8ly-task-dashboard-estimated-time">
                            <Icon type="fa" name="clock-o" style={{ marginRight: 5 }} />
                            <span>
                              {task.time}
                              <span className="integr8ly-task-dashboard-estimated-time_minutes">
                                {t('tutorial.minutes')}
                              </span>
                            </span>
                          </div>
                        }
                        stacked
                      />
                    ))}
                  </ListView>
                  <div className="pull-right integr8ly-task-dashboard-time-to-completion pf-u-mb-lg">
                    <Button bsStyle="primary" onClick={e => this.getStarted(e, id)}>
                      {t('tutorial.getStarted')}
                    </Button>
                  </div>
                </GridItem>
              </Grid>
            </PageSection>
          </Page>
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
  thread: PropTypes.object,
  getWalkthrough: PropTypes.func,
  getProgress: PropTypes.func,
  user: PropTypes.object,
  walkthroughResources: PropTypes.object,
  middlewareServices: PropTypes.object
};

TutorialPage.defaultProps = {
  history: {
    push: noop
  },
  match: {
    params: {}
  },
  getProgress: noop,
  user: {},
  thread: null,
  getWalkthrough: noop,
  walkthroughResources: {},
  middlewareServices: {
    data: {},
    amqCredentials: {},
    enmasseCredentials: {}
  }
};

const mapDispatchToProps = dispatch => ({
  getThread: (language, id) => dispatch(reduxActions.threadActions.getThread(language, id)),
  getWalkthrough: id => dispatch(reduxActions.threadActions.getCustomThread(id)),
  getProgress: () => dispatch(reduxActions.userActions.getProgress())
});

const mapStateToProps = state => ({
  ...state.threadReducers,
  ...state.middlewareReducers,
  ...state.walkthroughServiceReducers,
  ...state.userReducers
});

const ConnectedTutorialPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(TutorialPage));

const RoutedTutorialPage = withRouter(ConnectedTutorialPage);

export { RoutedTutorialPage as default, ConnectedTutorialPage, TutorialPage };
