import React from 'react';
import {
  Brand,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  Page,
  PageHeader,
  PageSection,
  TextContent,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import accessibleStyles from '@patternfly/patternfly-next/utilities/Accessibility/accessibility.css';
import { css } from '@patternfly/react-styles';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { noop, Button, Grid, Icon, ListView } from 'patternfly-react';

import { logout } from '../../services/openshiftServices';
import WalkthroughResources from '../../components/walkthroughResources/walkthroughResources';
import brandImg from '../../img/Logo_RH_SolutionExplorer_White.png';
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
      match: {
        params: { id }
      }
    } = this.props;
    getWalkthrough(id);
    // this.loadThread();
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
    const { isDropdownOpen } = this.state;
    const userDropdownItems = [<DropdownItem onClick={this.onLogoutUser}>Log out</DropdownItem>];

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

    const logoProps = {
      onClick: () => this.onTitleClick(),
      target: '_blank'
    };

    const PageToolbar = (
      <Toolbar>
        <ToolbarGroup className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnLg)}>
          <ToolbarItem className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnMd)}>
            <Dropdown
              isPlain
              position="right"
              onSelect={this.onDropdownSelect}
              isOpen={isDropdownOpen}
              toggle={
                <DropdownToggle onToggle={this.onDropdownToggle}>
                  {window.localStorage.getItem('currentUserName')}
                </DropdownToggle>
              }
              dropdownItems={userDropdownItems}
            />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );

    const Header = (
      <PageHeader
        logo={<Brand src={brandImg} alt="Red Hat Solution Explorer" />}
        logoProps={logoProps}
        toolbar={PageToolbar}
      />
    );

    if (thread.fulfilled && thread.data) {
      const attrs = getDocsForWalkthrough(id, this.props.middlewareServices, this.props.walkthroughResources);
      const parsedAttrs = Object.assign({}, getDefaultAdocAttrs(id), attrs);
      const parsedThread = parseWalkthroughAdoc(thread.data, parsedAttrs);
      return (
        <React.Fragment>
          <Page header={Header}>
            <PageSection>
              <TextContent>
                <Grid fluid>
                  <Grid.Row className="pf-c-content">
                    <Grid.Col xs={12} sm={9} className="integr8ly-task-container">
                      <div className="integr8ly-task-dashboard-header">
                        <h3 className="pf-u-mt-lg">{parsedThread.title}</h3>
                        <Button bsStyle="primary" onClick={e => this.getStarted(e, id)}>
                          {t('tutorial.getStarted')}
                        </Button>
                      </div>
                      {this.renderPrereqs(thread)}
                      <div dangerouslySetInnerHTML={{ __html: parsedThread.preamble }} />
                    </Grid.Col>
                    <Grid.Col sm={3} className="integr8ly-module-frame">
                      <WalkthroughResources resources={parsedThread.resources} />
                    </Grid.Col>
                  </Grid.Row>
                  <Grid.Row className="pf-c-content">
                    <Grid.Col xs={12} sm={9}>
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
                    </Grid.Col>
                  </Grid.Row>
                </Grid>
              </TextContent>
            </PageSection>
          </Page>
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
  thread: PropTypes.object,
  getWalkthrough: PropTypes.func,
  walkthroughResources: PropTypes.object,
  middlewareServices: PropTypes.object
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
  getWalkthrough: id => dispatch(reduxActions.threadActions.getCustomThread(id))
});

const mapStateToProps = state => ({
  ...state.threadReducers,
  ...state.middlewareReducers,
  ...state.walkthroughServiceReducers
});

const ConnectedTutorialPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(TutorialPage));

const RoutedTutorialPage = withRouter(ConnectedTutorialPage);

export { RoutedTutorialPage as default, ConnectedTutorialPage, TutorialPage };
