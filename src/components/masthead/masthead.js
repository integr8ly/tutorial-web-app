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
import { noop } from 'patternfly-react';
import { withRouter } from 'react-router-dom';
import { connect, reduxActions, store } from '../../redux';
import { AboutModal } from '../aboutModal/aboutModal';
import { logout } from '../../services/openshiftServices';
import brandImg from '../../img/Logo_RH_SolutionExplorer_White.png';

class Masthead extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isUserDropdownOpen: false,
      isModalOpen: false
    };

    this.onTitleClick = this.onTitleClick.bind(this);
    this.onLogoutUser = this.onLogoutUser.bind(this);

    this.onUserDropdownToggle = this.onUserDropdownToggle.bind(this);
    this.onUserDropdownSelect = this.onUserDropdownSelect.bind(this);
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

  closeAbout() {
    this.setState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen
    }));
  }

  handleModalToggle = () => {
    this.setState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen
    }));
  };

  onTitleClick = () => {
    const { history } = this.props;
    history.push(`/`);
    window.location.href = '/';
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

  render() {
    const { isUserDropdownOpen } = this.state;

    const logoProps = {
      onClick: () => this.onTitleClick()
    };

    const MastheadToolbar = (
      <React.Fragment>
        <Toolbar>
          <ToolbarGroup className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnLg)}>
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
              >
                <DropdownItem key="logout" component="button" href="#logout" onClick={this.onLogoutUser}>
                  Log out
                </DropdownItem>
                <DropdownItem key="about" component="button" href="#about" onClick={this.handleModalToggle}>
                  About
                </DropdownItem>
              </Dropdown>
            </ToolbarItem>
          </ToolbarGroup>
        </Toolbar>
        {this.state.isModalOpen && <AboutModal isOpen={this.state.isModalOpen} closeAbout={this.closeAbout} />}
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

export { RoutedConnectedMasthead as default, ConnectedMasthead, Masthead };
