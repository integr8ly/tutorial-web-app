import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { noop, Icon, ListView } from 'patternfly-react';
import {
  BackgroundImage,
  BackgroundImageSrc,
  Button,
  Card,
  CardBody,
  Grid,
  GridItem,
  Page,
  PageSection
} from '@patternfly/react-core';
import { connect, reduxActions } from '../../redux';
import WalkthroughResources from '../../components/walkthroughResources/walkthroughResources';
import { parseWalkthroughAdoc } from '../../common/walkthroughHelpers';
import { getDocsForWalkthrough, getDefaultAdocAttrs } from '../../common/docsHelpers';
import { RoutedConnectedMasthead } from '../../components/masthead/masthead';

class TutorialPage extends React.Component {
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
      const bgImages = {
        [BackgroundImageSrc.xs]: '/assets/images/pfbg_576.jpg',
        [BackgroundImageSrc.xs2x]: '/assets/images/pfbg_576@2x.jpg',
        [BackgroundImageSrc.sm]: '/assets/images/pfbg_768.jpg',
        [BackgroundImageSrc.sm2x]: '/assets/images/pfbg_768@2x.jpg',
        [BackgroundImageSrc.lg]: '/assets/images/pfbg_1200.jpg',
        [BackgroundImageSrc.filter]: '/assets/images/background-filter.svg#image_overlay'
      };

      return (
        <React.Fragment>
          <BackgroundImage src={bgImages} />
          <Page className="pf-u-h-100vh">
            <RoutedConnectedMasthead />
            <PageSection className="integr8ly-landing-page-tutorial-dashboard-section">
              <Grid gutter="md" className="pf-c-content">
                <GridItem sm={12} md={9} className="integr8ly-task-container">
                  <Card className="integr8ly-c-card--content pf-u-mb-xl">
                    <CardBody>
                      <div className="integr8ly-task-dashboard-header">
                        <h1>{parsedThread.title}</h1>
                        <Button variant="primary" type="button" onClick={e => this.getStarted(e, id)}>
                          {t('tutorial.getStarted')}
                        </Button>
                      </div>
                      {this.renderPrereqs(thread)}
                      <div dangerouslySetInnerHTML={{ __html: parsedThread.preamble }} />
                      {/* <AsciiDocTemplate
                        adoc={thread}
                        attributes={Object.assign({}, thread.data.attributes)}
                      /> */}
                    </CardBody>
                  </Card>
                </GridItem>
                <GridItem
                  md={3}
                  rowSpan={2}
                  className="integr8ly-module-frame pf-u-display-none pf-u-display-block-on-md"
                >
                  <WalkthroughResources
                    className="integr8ly-landing-page-tutorial-dashboard-section-right"
                    resources={parsedThread.resources}
                  />
                </GridItem>
                <GridItem sm={12} md={9}>
                  <Card className="integr8ly-card">
                    <CardBody>
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
                        <Button variant="primary" type="button" onClick={e => this.getStarted(e, id)}>
                          {t('tutorial.getStarted')}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
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
