import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Masthead as PfMasthead, MenuItem } from 'patternfly-react';
import { withRouter } from 'react-router-dom';
import { connect, reduxActions, store } from '../../redux';
import { aboutModalTypes } from '../../redux/constants';
import titleImg from '../../img/brand-alt-solutions-explorer.svg';

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
    // TBD 092718 - placeholder until logout is implemented
    window.localStorage.clear();
    window.location.href = '/';
  };

  onTitleClick = () => {
    window.location.href = '/';
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
    const { user } = this.props;
    const title = (
      <React.Fragment>
        <Icon type="pf" name="user" key="user-icon" />{' '}
        {user && (
          <span className="dropdown-title" key="dropdown-title">
            {user.username} {` `}
          </span>
        )}
      </React.Fragment>
    );

    return (
      <PfMasthead.Dropdown id="app-user-dropdown" title={title}>
        <MenuItem onClick={this.onLogoutUser}>Logout</MenuItem>
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
  user: PropTypes.shape({
    username: PropTypes.string
  })
};

Masthead.defaultProps = {
  user: {}
};

const mapDispatchToProps = dispatch => ({
  logoutUser: () => dispatch(reduxActions.userActions.logoutUser())
});

const mapStateToProps = state => ({
  user: state.userReducers.session
});

const ConnectedMasthead = connect(
  mapStateToProps,
  mapDispatchToProps
)(Masthead);

const RoutedConnectedMasthead = withRouter(ConnectedMasthead);

export { RoutedConnectedMasthead as default, ConnectedMasthead, Masthead };
