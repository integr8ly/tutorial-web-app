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
      isUserDropdownOpen: false,
      showAboutModal: false
    };

    this.onTitleClick = this.onTitleClick.bind(this);
    this.onLogoutUser = this.onLogoutUser.bind(this);

    this.onUserDropdownToggle = this.onUserDropdownToggle.bind(this);
    this.onUserDropdownSelect = this.onUserDropdownSelect.bind(this);

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
    console.log('Settings was clicked!');
  };

  render() {
    const { isUserDropdownOpen, showAboutModal } = this.state;

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
                <i className="fas fa-cog" aria-hidden="true" />
              </Button>
            </ToolbarItem>
            <ToolbarItem className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnMd)}>
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
                  </DropdownItem>,
                  <DropdownItem key="about" component="button" href="#about" onClick={this.onAboutModal}>
                    About
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
