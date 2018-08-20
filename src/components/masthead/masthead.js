import React from 'react';
import PropTypes from 'prop-types';
import { noop, Icon, Masthead as PfMasthead, MenuItem } from 'patternfly-react';
import { connect, reduxActions, store } from '../../redux';
import iconImg from '../../img/logo-alt.svg';
import titleImg from '../../img/brand-alt.svg';
import reduxTypes from '../../redux/constants';

class Masthead extends React.Component {
  state = {
    mobileToggle: true
  };

  onAbout = e => {
    e.preventDefault();
    store.dispatch({
      type: reduxTypes.aboutModal.ABOUT_MODAL_SHOW
    });
  };

  onHelp = e => {
    e.preventDefault();
  };

  onLogoutUser = e => {
    const { logoutUser } = this.props;

    e.preventDefault();
    Promise.all([logoutUser()]).then(() => window.location.replace('/'));
  };

  navToggle = () => {
    const { mobileToggle } = this.state;

    this.setState({ mobileToggle: !mobileToggle });
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
            <a role="menuitem" href="#help" onClick={this.onHelp} className="hidden">
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
      <PfMasthead.Dropdown id="app-help-dropdown" noCaret title={<span aria-hidden className="pficon pficon-help" />}>
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
      <PfMasthead
        iconImg={iconImg}
        titleImg={titleImg}
        title="PatternFly Enterprise Application"
        onNavToggleClick={this.navToggle}
      >
        <PfMasthead.Collapse>
          {this.renderActions()}
          {this.renderUserDropdown()}
        </PfMasthead.Collapse>
        {this.renderMobileNav()}
      </PfMasthead>
    );
  }
}

Masthead.propTypes = {
  logoutUser: PropTypes.func,
  user: PropTypes.shape({
    username: PropTypes.string
  })
};

Masthead.defaultProps = {
  logoutUser: noop,
  user: {}
};

const mapDispatchToProps = dispatch => ({
  logoutUser: () => dispatch(reduxActions.user.logoutUser())
});

const mapStateToProps = state => ({
  user: state.user.session
});

const ConnectedMasthead = connect(
  mapStateToProps,
  mapDispatchToProps
)(Masthead);

export { ConnectedMasthead as default, ConnectedMasthead, Masthead };
