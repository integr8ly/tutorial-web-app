import * as React from 'react';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import LandingPageMastHead from './landingPageMastHead';
import InstalledAppsView from '../../components/installedAppsView/InstalledAppsView';
import OpenShiftResourceParser from '../../components/openshiftResourceParser';

class LandingPage extends React.Component {
  state = {
    apps: []
  };

  componentDidMount() {
    const parser = new OpenShiftResourceParser(window.OPENSHIFT_CONFIG);
    parser
      .listProvisionedMWServices('eval')
      .then(provisionedServiceList => {
        this.setState({ apps: provisionedServiceList });
      })
      .catch(err => console.error(err));
  }

  render() {
    return (
      <div>
        <LandingPageMastHead />
        <section className="app-landing-page-tutorial-dashboard-section">
          <TutorialDashboard className="app-landing-page-tutorial-dashboard-section-left" />
          <InstalledAppsView className="app-landing-page-tutorial-dashboard-section-right" apps={this.state.apps} />
        </section>
      </div>
    );
  }
}

export default LandingPage;
