import * as React from 'react';
import {
  BackgroundImage,
  BackgroundImageSrc,
  Brand,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  Page,
  PageHeader,
  PageSection,
  TextContent,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import accessibleStyles from '@patternfly/patternfly-next/utilities/Accessibility/accessibility.css';
import { css } from '@patternfly/react-styles';

import PropTypes from 'prop-types';
import { noop } from 'patternfly-react';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import InstalledAppsView from '../../components/installedAppsView/InstalledAppsView';
import { connect, reduxActions } from '../../redux';
import { logout } from '../../services/openshiftServices';
import brandImg from '../../img/brand-alt-solutions-explorer.svg';

class LandingPage extends React.Component {
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
  componentDidMount() {
    const { getProgress, getCustomWalkthroughs } = this.props;
    getCustomWalkthroughs();
    getProgress();
  }

  render() {
    const { walkthroughServices, middlewareServices, user } = this.props;
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
    const bgImages = {
      [BackgroundImageSrc.lg]: '/assets/images/pfbg_1200.jpg',
      [BackgroundImageSrc.sm]: '/assets/images/pfbg_768.jpg',
      [BackgroundImageSrc.sm2x]: '/assets/images/pfbg_768@2x.jpg',
      [BackgroundImageSrc.xs]: '/assets/images/pfbg_576.jpg',
      [BackgroundImageSrc.xs2x]: '/assets/images/pfbg_576@2x.jpg',
      [BackgroundImageSrc.filter]: '/assets/images/background-filter.svg#image_overlay'
    };

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

    const LandingPageMastHead = () => (
      <header className="row integr8ly-landing-page-masthead pf-c-content">
        <div className="col-xs-12">
          <h1 className="pf-u-mt-lg">Welcome to the Red Hat Solution Explorer</h1>
          <p>
            Get started with an end-to-end solution walkthrough or
            <br />
            use any of the available application services to create custom integrations.
          </p>
        </div>
      </header>
    );

    return (
      <React.Fragment>
        <Page header={Header}>
          <PageSection>
            <TextContent>{LandingPageMastHead}</TextContent>
          </PageSection>
          <LandingPageMastHead />
          <BackgroundImage src={bgImages} />
          <PageSection>
            <TextContent>
              <main>
                <section className="integr8ly-landing-page-tutorial-dashboard-section">
                  <TutorialDashboard
                    className="integr8ly-landing-page-tutorial-dashboard-section-left"
                    userProgress={user.userProgress}
                    walkthroughs={walkthroughServices.data}
                  />
                  <InstalledAppsView
                    className="integr8ly-landing-page-tutorial-dashboard-section-right"
                    apps={Object.values(middlewareServices.data)}
                    customApps={middlewareServices.customServices}
                  />
                </section>
              </main>
            </TextContent>
          </PageSection>
        </Page>
      </React.Fragment>
    );
  }
}

LandingPage.propTypes = {
  getProgress: PropTypes.func,
  getCustomWalkthroughs: PropTypes.func,
  middlewareServices: PropTypes.object,
  walkthroughServices: PropTypes.object,
  user: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

LandingPage.defaultProps = {
  getProgress: noop,
  getCustomWalkthroughs: noop,
  middlewareServices: { data: {} },
  walkthroughServices: { data: {} },
  user: { userProgress: {} },
  history: {
    push: noop
  }
};

const mapDispatchToProps = dispatch => ({
  getWalkthroughs: language => dispatch(reduxActions.walkthroughActions.getWalkthroughs(language)),
  getCustomWalkthroughs: () => dispatch(reduxActions.walkthroughActions.getCustomWalkthroughs()),
  getProgress: () => dispatch(reduxActions.userActions.getProgress())
});

const mapStateToProps = state => ({
  ...state.middlewareReducers,
  ...state.walkthroughServiceReducers,
  ...state.userReducers
});

const ConnectedLandingPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(LandingPage);

export { ConnectedLandingPage as default, LandingPage };
