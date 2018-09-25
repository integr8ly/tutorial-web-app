import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { noop, Button, Grid, Icon, ListView } from 'patternfly-react';
import { connect, reduxActions } from '../../redux';
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
          <Grid fluid>
            <Grid.Row>
              <Grid.Col xs={12} sm={8} className="integr8ly-task-container">
                <AsciiDocTemplate adoc={thread.data.descriptionDoc} />
                <Button bsStyle="primary" onClick={e => this.getStarted(e, thread.data.id)}>
                  {t('tutorial.getStarted')}
                </Button>
              </Grid.Col>
              <Grid.Col sm={4} className="integr8ly-helpful-links">
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
            <Grid.Row>
              <Grid.Col xs={12} sm={8}>
                <h3>
                  {t('tutorial.tasksToComplete')}
                  <div className="pull-right integr8ly-task-dashboard-time-to-completion">
                    <Icon type="fa" name="clock-o" />{' '}
                    <span>
                      {thread.data.estimatedTime} {t('tutorial.minutes')}
                    </span>
                  </div>
                </h3>

                <ListView className="integr8ly-list-view-pf">
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
                      <div className="integr8ly-task-dashboard-estimated-time">
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
              <Grid.Col xs={12} sm={8}>
                <Button bsStyle="primary" onClick={e => this.getStarted(e, thread.data.id)}>
                  {t('tutorial.getStarted')}
                </Button>
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
