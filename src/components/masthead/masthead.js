import React from 'react';
import PropTypes from 'prop-types';
import {
  Brand,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  PageHeader,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import accessibleStyles from '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import { css } from '@patternfly/react-styles';
import { noop } from 'patternfly-react';
import { withRouter } from 'react-router-dom';
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
                  <DropdownToggle onToggle={this.onHelpDropdownToggle}>
                    <Button
                      className="pf-c-button pf-m-plain"
                      aria-label="Help"
                      variant="plain"
                      onClick={this.onSettingsClick}
                    >
                      <i className="fas fa-question-circle" aria-hidden="true" />
                    </Button>
                  </DropdownToggle>
                }
                dropdownItems={[
                  <DropdownItem
                    key="help-cmd-1"
                    component="button"
                    href="#helpcmd1"
                    onClick={() => console.log('Help menu command 1 clicked!')}
                  >
                    Help Command 1
                  </DropdownItem>,
                  <DropdownItem
                    key="help-cmd-2"
                    component="button"
                    href="#helpcmd2"
                    onClick={() => console.log('Help menu command 2 clicked!')}
                  >
                    Help Command 2
                  </DropdownItem>,
                  <DropdownItem key="about" component="button" href="#about" onClick={this.onAboutModal}>
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
                dropdownItems={[
                  <DropdownItem key="logout" component="button" href="#logout" onClick={this.onLogoutUser}>
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

export { Masthead as default, ConnectedMasthead, RoutedConnectedMasthead, Masthead };
