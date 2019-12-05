import React from 'react';
import PropTypes from 'prop-types';
import {
  Brand,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownSeparator,
  PageHeader,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { CogIcon, HelpIcon } from '@patternfly/react-icons';
import accessibleStyles from '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import { css } from '@patternfly/react-styles';
import { withRouter } from 'react-router-dom';
import { noop } from '../../common/helpers';
import { connect, reduxActions } from '../../redux';
import { AboutModal } from '../aboutModal/aboutModal';
import { logout } from '../../services/openshiftServices';
import brandImg from '../../img/Logo_RH_SolutionExplorer_White.png';

class Masthead extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isHelpDropdownOpen: false,
      isUserDropdownOpen: false,
      showAboutModal: false
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

  onHelpDropdownSelect = () => {
    this.setState({
      isHelpDropdownOpen: !this.state.isHelpDropdownOpen
    });
  };

  render() {
    const { isUserDropdownOpen, isHelpDropdownOpen, showAboutModal } = this.state;

    const logoProps = {
      onClick: () => this.onTitleClick()
    };

    const gsUrl =
      'https://access.redhat.com/documentation/en-us/red_hat_managed_integration/1/html-single/getting_started/';
    const riUrl =
      'https://access.redhat.com/documentation/en-us/red_hat_managed_integration/1/html-single/release_notes/';
    const csUrl = 'https://access.redhat.com/support/';

    const MastheadToolbar = (
      <React.Fragment>
        <Toolbar>
          <ToolbarGroup className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnLg)}>
            <ToolbarItem className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnMd)}>
              <Button
                className="pf-c-button pf-m-plain"
                aria-label="Settings"
                variant="plain"
                onClick={this.onSettingsClick}
              >
                <CogIcon />
              </Button>
            </ToolbarItem>
            <ToolbarItem className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnMd)}>
              <Dropdown
                isPlain
                position="right"
                onSelect={this.onHelpDropdownSelect}
                isOpen={isHelpDropdownOpen}
                toggle={
                  <DropdownToggle
                    iconComponent={null}
                    onToggle={this.onHelpDropdownToggle}
                    aria-label="Link to Help page"
                  >
                    <HelpIcon />
                  </DropdownToggle>
                }
                autoFocus={false}
                dropdownItems={[
                  <DropdownItem
                    key="help-getting-started"
                    href={gsUrl}
                    target="_blank"
                    aria-label="Link to getting started page"
                  >
                    Getting started
                  </DropdownItem>,
                  <DropdownItem
                    key="help-release-info"
                    href={riUrl}
                    target="_blank"
                    aria-label="Link to release information page"
                  >
                    Release information
                  </DropdownItem>,
                  <DropdownItem
                    key="help-customer-support"
                    href={csUrl}
                    target="_blank"
                    aria-label="Link to customer support page"
                  >
                    Customer support
                  </DropdownItem>,
                  <DropdownSeparator key="help-separator-1" />,
                  <DropdownItem key="help-dev-resources" onClick={this.onDevResourcesClick}>
                    Developer resources
                  </DropdownItem>,
                  <DropdownSeparator key="help-separator-2" />,
                  <DropdownItem
                    key="about"
                    component="button"
                    href="#about"
                    onClick={this.onAboutModal}
                    aria-label="About"
                  >
                    About
                  </DropdownItem>
                ]}
              />
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarGroup className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnSm)}>
            <ToolbarItem className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnSm)}>
              <Dropdown
                isPlain
                position="right"
                onSelect={this.onUserDropdownSelect}
                isOpen={isUserDropdownOpen}
                toggle={
                  <DropdownToggle onToggle={this.onUserDropdownToggle}>
                    {window.localStorage.getItem('currentUserName')}
                  </DropdownToggle>
                }
                autoFocus={false}
                dropdownItems={[
                  <DropdownItem
                    key="logout"
                    component="button"
                    href="#logout"
                    onClick={this.onLogoutUser}
                    aria-label="Log out of the system"
                  >
                    Log out
                  </DropdownItem>
                ]}
              />
            </ToolbarItem>
          </ToolbarGroup>
        </Toolbar>
        {showAboutModal && <AboutModal isOpen={showAboutModal} closeAboutModal={this.closeAboutModal} />}
      </React.Fragment>
    );

    return (
      <PageHeader
        logo={<Brand src={brandImg} alt="Red Hat Solution Explorer" />}
        logoProps={logoProps}
        toolbar={MastheadToolbar}
      />
    );
  }
}

Masthead.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

Masthead.defaultProps = {
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
