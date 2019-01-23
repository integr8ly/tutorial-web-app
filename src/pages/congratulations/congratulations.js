import React from 'react';
import {
  Brand,
  Bullseye,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateAction,
  Page,
  PageHeader,
  PageSection,
  TextContent,
  Title,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import accessibleStyles from '@patternfly/patternfly-next/utilities/Accessibility/accessibility.css';
import { css } from '@patternfly/react-styles';

import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { noop, Button } from 'patternfly-react';
import { logout } from '../../services/openshiftServices';
import brandImg from '../../img/Logo_RH_SolutionExplorer_White.png';

import { connect, reduxActions } from '../../redux';

class CongratulationsPage extends React.Component {
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

  exitTutorial = e => {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/`);
  };

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

    const Header = (
      <PageHeader
        logo={<Brand src={brandImg} alt="Red Hat Solution Explorer" />}
        logoProps={logoProps}
        toolbar={PageToolbar}
      />
    );

    return (
      <React.Fragment>
        <Page header={Header}>
          <PageSection className="pf-m-dark-100 integr8ly-congratulations">
            <TextContent>
              <Bullseye>
                <EmptyState>
                  <img src="/assets/images/congratulations.svg" alt="congratulations" width="200px" height="200px" />
                  <Title size="4xl">Congratulations, you completed the walkthrough!</Title>
                  <EmptyStateBody>
                    Return to your homepage to explore more walkthroughs or go to your OpenShift console to utilize what
                    you just built!
                  </EmptyStateBody>
                  <EmptyStateAction>
                    <Button bsStyle="default" onClick={e => this.exitTutorial(e)}>
                      Return to Home Page
                    </Button>{' '}
                  </EmptyStateAction>
                </EmptyState>
              </Bullseye>
            </TextContent>
          </PageSection>
        </Page>
      </React.Fragment>
    );
  }
}

CongratulationsPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

CongratulationsPage.defaultProps = {
  history: {
    push: noop
  }
};

const mapDispatchToProps = dispatch => ({
  getThread: (language, id) => dispatch(reduxActions.threadActions.getThread(language, id))
});

const mapStateToProps = state => ({
  ...state.threadReducers
});

const ConnectedCongratulationsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(CongratulationsPage);

const RouterCongratulationsPage = withRouter(CongratulationsPage);

export { RouterCongratulationsPage as default, ConnectedCongratulationsPage, CongratulationsPage };
