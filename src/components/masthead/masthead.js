import React from 'react';
import PropTypes from 'prop-types';
import {
  Brand,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  PageHeader,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import accessibleStyles from '@patternfly/patternfly-next/utilities/Accessibility/accessibility.css';
import { css } from '@patternfly/react-styles';
import { noop, Icon, MenuItem } from 'patternfly-react';
import { withRouter } from 'react-router-dom';
import { connect, reduxActions, store } from '../../redux';
import { aboutModalTypes } from '../../redux/constants';
import { logout } from '../../services/openshiftServices';
import brandImg from '../../img/Logo_RH_SolutionExplorer_White.png';

class Masthead extends React.Component {
  state = {
    mobileToggle: true
  };

  onAbout = () => {
    store.dispatch({
      type: aboutModalTypes.ABOUT_MODAL_SHOW
    });
  };

  onHelp = () => {
    window.location.href = '/help';
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

  onDropdownSelect = event => {
    this.setState({
      isDropdownOpen: !this.state.isDropdownOpen
    });
  };

  renderMobileNav() {
    const { mobileToggle } = this.state;

    if (mobileToggle) {
      return null;
    }

    return (
      <div
        role="menu"
        className="nav-pf-vertical nav-pf-vertical-with-sub-menus nav-pf-vertical-with-badges hidden show-mobile-nav"
        aria-live="polite"
      >
        <ul className="list-group">
          <li className="list-group-item">
            <a role="menuitem" href="#about" onClick={this.onAbout}>
              <span className="list-group-item-value">About</span>
            </a>
          </li>
          <li className="list-group-item">
            <a role="menuitem" href="#help" onClick={this.onHelp}>
              <span className="list-group-item-value">Help</span>
            </a>
          </li>
          <li className="list-group-item">
            <a role="menuitem" href="#logout" onClick={this.onLogoutUser}>
              <span className="list-group-item-value">Logout</span>
            </a>
          </li>
        </ul>
      </div>
    );
  }

  renderActions() {
    return (
      <PageHeader.Dropdown id="app-help-dropdown" title={<span aria-hidden className="pficon pficon-help" />}>
        <MenuItem eventKey="1" onClick={this.onHelp}>
          Help
        </MenuItem>
        <MenuItem eventKey="2" onClick={this.onAbout}>
          About
        </MenuItem>
      </PageHeader.Dropdown>
    );
  }

  renderUserDropdown() {
    const title = (
      <React.Fragment>
        <Icon type="pf" name="user" key="user-icon" />{' '}
        <span className="dropdown-title" key="dropdown-title">
          {window.localStorage.getItem('currentUserName')} {` `}
        </span>
      </React.Fragment>
    );

    return (
      <PageHeader.Dropdown id="app-user-dropdown" title={title}>
        <MenuItem onClick={this.onLogoutUser}>Log Out</MenuItem>
      </PageHeader.Dropdown>
    );
  }

  render() {
    const { isDropdownOpen } = this.state;
    const userDropdownItems = [<DropdownItem onClick={this.onLogoutUser}>Log out</DropdownItem>];

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

    const logoProps = {
      onClick: () => this.onTitleClick(),
      target: '_blank'
    };

    return (
      <PageHeader
        logo={<Brand src={brandImg} alt="Red Hat Solution Explorer" />}
        logoProps={logoProps}
        toolbar={PageToolbar}
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

export { RoutedConnectedMasthead as default, ConnectedMasthead, Masthead };
