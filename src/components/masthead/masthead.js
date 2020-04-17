import React from 'react';
import PropTypes from 'prop-types';
import { CrossNavHeader } from '@rh-uxd/integration-react';
import {
  Brand,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownSeparator,
  PageHeader,
  PageHeaderTools,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
  Tooltip,
  TooltipPosition
} from '@patternfly/react-core';
import { CogIcon, HelpIcon } from '@patternfly/react-icons';
import accessibleStyles from '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import { css } from '@patternfly/react-styles';
import { withRouter } from 'react-router-dom';
import { noop } from '../../common/helpers';
import { connect, reduxActions } from '../../redux';
import { AboutModal } from '../aboutModal/aboutModal';
import { logout, getAppsList } from '../../services/openshiftServices';
import solutionExplorerImg from '../../img/Logo-Solution-Explorer-Reverse-RGB.svg';
import managedIntegrationSolutionExplorerImg from '../../img/Logo-Red-Hat-Managed-Integration-Solution-Explorer-Reverse-RGB.svg';
import adminIcon from '../../img/Icon-Red_Hat-People_and_Audiences-User-A-Black-RGB-Admin.svg';
import devIcon from '../../img/Icon-Red_Hat-People_and_Audiences-User-A-Black-RGB-Dev.svg';

class Masthead extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isHelpDropdownOpen: false,
      isUserDropdownOpen: false,
      showAboutModal: false,
      appList: null
    };

    this.onTitleClick = this.onTitleClick.bind(this);
    this.onLogoutUser = this.onLogoutUser.bind(this);

    this.onUserDropdownToggle = this.onUserDropdownToggle.bind(this);
    this.onUserDropdownSelect = this.onUserDropdownSelect.bind(this);

    this.onHelpDropdownToggle = this.onHelpDropdownToggle.bind(this);
    this.onHelpDropdownSelect = this.onHelpDropdownSelect.bind(this);

    this.onAboutModal = this.onAboutModal.bind(this);
    this.closeAboutModal = this.closeAboutModal.bind(this);
  }

  onLogoutUser = () => {
    if (window.OPENSHIFT_CONFIG.mockData) {
      window.localStorage.clear();
      window.location.href = '/';
      return;
    }
    logout().then(() => {
      window.location.href = window.OPENSHIFT_CONFIG.ssoLogoutUri;
    });
  };

  onAboutModal(e) {
    e.preventDefault();
    this.setState({ showAboutModal: true });
  }

  closeAboutModal() {
    this.setState({ showAboutModal: false });
  }

  onTitleClick = () => {
    const { history } = this.props;
    history.push('/');
  };

  onUserDropdownToggle(isUserDropdownOpen) {
    this.setState({
      isUserDropdownOpen
    });
  }

  onUserDropdownSelect = () => {
    this.setState({
      isUserDropdownOpen: !this.state.isUserDropdownOpen
    });
  };

  onSettingsClick = () => {
    const { history } = this.props;
    history.push(`/settings`);
  };

  onDevResourcesClick = () => {
    const { history } = this.props;
    history.push(`/dev-resources`);
  };

  onHelpDropdownToggle(isHelpDropdownOpen) {
    this.setState({
      isHelpDropdownOpen
    });
  }

  getLogo = () => {
    let clusterType = '';
    let logoName = '';
    if (window.OPENSHIFT_CONFIG) {
      clusterType = window.OPENSHIFT_CONFIG.mockData ? 'localhost' : window.OPENSHIFT_CONFIG.clusterType;
      if (clusterType === 'poc') {
        logoName = managedIntegrationSolutionExplorerImg;
      } else if (clusterType === 'osd') {
        logoName = managedIntegrationSolutionExplorerImg;
      } else {
        logoName = solutionExplorerImg;
      }
    }
    return logoName;
  };

  getUserMenuResources = isAdmin => {
    const userMenuItems = [];
    const loginName = window.localStorage.getItem('loginName');
    userMenuItems.push(
      <DropdownItem
        key="user-menu-item-placeholder"
        href="https://www.google.com"
        target="_blank"
        aria-label="Link to user menu item placeholder"
        isDisabled
        className="pf-c-dropdown__menu-item pf-c-dropdown__menu-item--user"
      >
        <div className="user-menu">
          <div className="user-menu-icon">
            {isAdmin ? (
              <img src={adminIcon} alt="administrator icon" className="user-menu-icon-img" />
            ) : (
              <img src={devIcon} alt="developer icon" className="user-menu-icon-img" />
            )}
          </div>
          <div>
            <p>{loginName}</p>
          </div>
          <div>
            {isAdmin ? (
              <span className="pf-c-label pf-c-label--admin pf-m-compact">Administrator</span>
            ) : (
              <span className="pf-c-label pf-c-label--dev pf-m-compact">Developer</span>
            )}
          </div>
        </div>
      </DropdownItem>
    );
    userMenuItems.push(<DropdownSeparator key="user-separator-1" className="pf-c-dropdown__separator--user" />);
    userMenuItems.push(
      <DropdownItem
        key="logout"
        component="button"
        href="#logout"
        onClick={this.onLogoutUser}
        aria-label="Log out of the system"
      >
        Log out
      </DropdownItem>
    );
    return userMenuItems;
  };

  getDeveloperResources(gsUrl, riUrl, csUrl) {
    const items = [];
    items.push(
      <DropdownItem key="help-getting-started" href={gsUrl} target="_blank" aria-label="Link to getting started page">
        Getting started
      </DropdownItem>
    );

    items.push(
      <DropdownItem key="help-release-info" href={riUrl} target="_blank" aria-label="Link to release information page">
        Release information
      </DropdownItem>
    );

    items.push(
      <DropdownItem key="help-customer-support" href={csUrl} target="_blank" aria-label="Link to customer support page">
        Customer support
      </DropdownItem>
    );

    if (window.OPENSHIFT_CONFIG && window.OPENSHIFT_CONFIG.openshiftVersion === 3) {
      items.push(
        <DropdownItem key="help-dev-resources" onClick={this.onDevResourcesClick}>
          Developer resources
        </DropdownItem>
      );
    }

    items.push(<DropdownSeparator key="help-separator-2" />);
    items.push(
      <DropdownItem key="about" component="button" href="#about" onClick={this.onAboutModal} aria-label="About">
        About
      </DropdownItem>
    );
    return items;
  }

  onHelpDropdownSelect = () => {
    this.setState({
      isHelpDropdownOpen: !this.state.isHelpDropdownOpen
    });
  };

  getCrossNavApps = () => {
    if (this.state.appList === null) {
      getAppsList().then(resp => {
        const appEntries = [];
        Object.entries(resp.data).forEach(app => {
          switch (app[0]) {
            case '3scale':
              appEntries.push({ id: app[0], name: '3 Scale', rootUrl: app[1].Host.replace(/(^\w+:|^)\/\//, '') });
              break;
            case 'amqonline':
              appEntries.push({ id: app[0], name: 'AMQ Online', rootUrl: app[1].Host.replace(/(^\w+:|^)\/\//, '') });
              break;
            case 'apicurito':
              appEntries.push({ id: app[0], name: 'Apicurito', rootUrl: app[1].Host.replace(/(^\w+:|^)\/\//, '') });
              break;
            case 'fuse-managed':
              appEntries.push({ id: app[0], name: 'Fuse', rootUrl: app[1].Host.replace(/(^\w+:|^)\/\//, '') });
              break;
            default:
              break;
          }
        });
        this.setState({ appList: appEntries });
      });
      return [];
    }
    return this.state.appList;
  };

  render() {
    const { isUserDropdownOpen, isHelpDropdownOpen, showAboutModal } = this.state;

    const logoProps = {
      onClick: () => this.onTitleClick()
    };

    let gsUrl = '';
    let riUrl = '';
    const csUrl = 'https://access.redhat.com/support/';
    let isAdmin = window.localStorage.getItem('currentUserIsAdmin') === 'true';
    const settingsTooltip =
      'Permissions needed. You must be logged in as an administrator to access the Settings page.';

    if (window.OPENSHIFT_CONFIG && window.OPENSHIFT_CONFIG.openshiftVersion === 3) {
      gsUrl =
        'https://access.redhat.com/documentation/en-us/red_hat_managed_integration/1/html-single/getting_started/';
      riUrl = 'https://access.redhat.com/documentation/en-us/red_hat_managed_integration/1/html-single/release_notes/';
      // no admin protection for openshift 3 or for running demo/locally
      isAdmin = true;
    } else {
      gsUrl =
        'https://access.redhat.com/documentation/en-us/red_hat_managed_integration/2/html-single/getting_started_with_red_hat_managed_integration_2/';
      riUrl =
        'https://access.redhat.com/documentation/en-us/red_hat_managed_integration/2/html-single/release_notes_for_red_hat_managed_integration_2/';
    }

    const MastheadToolbar = (
      <React.Fragment>
        <PageHeaderTools>
          <PageHeaderToolsGroup className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnLg)}>
            <PageHeaderToolsItem className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnMd)}>
              {isAdmin ? (
                <Button
                  className="pf-c-button pf-m-plain"
                  aria-label="Settings"
                  variant="plain"
                  onClick={this.onSettingsClick}
                >
                  <CogIcon />
                </Button>
              ) : (
                <Tooltip
                  position={TooltipPosition.bottom}
                  distance={30}
                  entryDelay={0}
                  content={<div>{settingsTooltip}</div>}
                >
                  <Button isActive={false} className="pf-c-button pf-m-plain" aria-label="Settings" variant="plain">
                    <CogIcon className="integr8ly-settings-button-disabled" />
                  </Button>
                </Tooltip>
              )}
            </PageHeaderToolsItem>
            <PageHeaderToolsItem className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnMd)}>
              <Dropdown
                isPlain
                position="right"
                onSelect={this.onHelpDropdownSelect}
                isOpen={isHelpDropdownOpen}
                toggle={
                  <DropdownToggle
                    toggleIndicator={null}
                    onToggle={this.onHelpDropdownToggle}
                    aria-label="Link to Help page"
                  >
                    <HelpIcon />
                  </DropdownToggle>
                }
                autoFocus={false}
                dropdownItems={this.getDeveloperResources(gsUrl, riUrl, csUrl)}
              />
            </PageHeaderToolsItem>
          </PageHeaderToolsGroup>
          <PageHeaderToolsGroup className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnSm)}>
            <PageHeaderToolsItem className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnSm)}>
              <Dropdown
                className="pf-c-dropdown pf-c-dropdown--user"
                isPlain
                position="right"
                onSelect={this.onUserDropdownSelect}
                isOpen={isUserDropdownOpen}
                toggle={
                  <DropdownToggle onToggle={this.onUserDropdownToggle}>
                    {this.props.currentUserName || window.localStorage.getItem('currentUserName')}
                  </DropdownToggle>
                }
                autoFocus={false}
                dropdownItems={this.getUserMenuResources(isAdmin)}
              />
            </PageHeaderToolsItem>
          </PageHeaderToolsGroup>
        </PageHeaderTools>
        {showAboutModal && <AboutModal isOpen={showAboutModal} closeAboutModal={this.closeAboutModal} />}
      </React.Fragment>
    );

    return (
      <CrossNavHeader
        apps={this.getCrossNavApps()}
        currentApp={{ id: 'solution-explorer', name: 'Solution Explorer', rootUrl: 'localhost:3000' }}
        logo={<Brand src={this.getLogo()} alt="Red Hat Solution Explorer" />}
        logoProps={logoProps}
        headerTools={MastheadToolbar}
      />
    );
  }
}

Masthead.propTypes = {
  currentUserName: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

Masthead.defaultProps = {
  currentUserName: null,
  history: {
    push: noop
  }
};

const mapDispatchToProps = dispatch => ({
  logoutUser: () => dispatch(reduxActions.userActions.logoutUser())
});

const ConnectedMasthead = connect(
  undefined,
  mapDispatchToProps
)(Masthead);

const RoutedConnectedMasthead = withRouter(ConnectedMasthead);

export { RoutedConnectedMasthead as default, ConnectedMasthead, RoutedConnectedMasthead, Masthead };
