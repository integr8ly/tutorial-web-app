import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { noop, Button, Grid, Icon, ListView } from 'patternfly-react';
import { connect, reduxActions } from '../../redux';
import AsciiDocTemplate from '../../components/asciiDocTemplate/asciiDocTemplate';
import PfMasthead from '../../components/masthead/masthead';

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
          <Grid fluid>
            <Grid.Row>
              <PfMasthead />
            </Grid.Row>
            <Grid.Row>
              <Grid.Col xs={12} sm={8} className="integr8ly-task-container">
                <div className="integr8ly-task-dashboard-header">
                  <h3>{thread.data.title}</h3>
                  <Button bsStyle="primary" onClick={e => this.getStarted(e, thread.data.id)}>
                    {t('tutorial.getStarted')}
                  </Button>
                </div>
                <div className="alert alert-primary" style={{ marginTop: 10 }}>
                  <h3 className="integr8ly-tutorial-prereqs">{t('tutorial.prereq')}</h3>
                  <ul className="fa-ul">
                    {thread.data.prerequisites.map((req, i) => (
                      <li key={i}>
                        <i className="fa-li fa fa-check-square-o" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <AsciiDocTemplate
                  adoc={thread.data.descriptionDoc}
                  attributes={Object.assign({}, thread.data.attributes)}
                />
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
            <Grid.Row>
              <Grid.Col xs={12} sm={9}>
                <h3>
                  {t('tutorial.tasksToComplete')}
                  <div className="pull-right integr8ly-task-dashboard-time-to-completion">
                    <Button bsStyle="primary" onClick={e => this.getStarted(e, thread.data.id)}>
                      {t('tutorial.getStarted')}
                    </Button>
                  </div>
                </h3>

                <ListView className="integr8ly-list-view-pf">
                  {thread.data.tasks.map((task, i) => (
                    <ListView.Item
                      key={i}
                      heading={`${i + 1}. ${task.title}`}
                      description={task.description}
                      actions={
                        <div className="integr8ly-task-dashboard-estimated-time">
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
