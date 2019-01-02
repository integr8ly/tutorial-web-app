import React from 'react';
import PropTypes from 'prop-types';
import { noop, Icon, Masthead as PfMasthead, MenuItem } from 'patternfly-react';
import { withRouter } from 'react-router-dom';
import { connect, reduxActions, store } from '../../redux';
import { aboutModalTypes } from '../../redux/constants';
import titleImg from '../../img/brand-alt-solutions-explorer.svg';
import { logout } from '../../services/openshiftServices';

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
      <PfMasthead.Dropdown id="app-help-dropdown" title={<span aria-hidden className="pficon pficon-help" />}>
        <MenuItem eventKey="1" onClick={this.onHelp}>
          Help
        </MenuItem>
        <MenuItem eventKey="2" onClick={this.onAbout}>
          About
        </MenuItem>
      </PfMasthead.Dropdown>
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
      <PfMasthead.Dropdown id="app-user-dropdown" title={title}>
        <MenuItem onClick={this.onLogoutUser}>Log Out</MenuItem>
      </PfMasthead.Dropdown>
    );
  }

  render() {
    return (
      <PfMasthead titleImg={titleImg} navToggle={false} onTitleClick={this.onTitleClick}>
        <PfMasthead.Collapse>{this.renderUserDropdown()}</PfMasthead.Collapse>
        {this.renderMobileNav()}
      </PfMasthead>
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
