import * as React from 'react';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import LandingPageMastHead from './landingPageMastHead';
import InstalledAppsView from '../../components/installedAppsView/InstalledAppsView';

const LandingPage = () => (
  <div>
    <LandingPageMastHead />
    <section>
      <div className="container">
        < TutorialDashboard />
      </div>
    </section>
    <section>
      <InstalledAppsView apps={[
        {
          appName: 'Red Hat OpenShift Application Runtimes',
          appDescription: 'Description of Red Hat OpenShift Application Runtimes'
        },
        { appName: 'Fuse Online', appDescription: 'Description of Fuse Online' },
        { appName: 'Eclipse Che', appDescription: 'Description of Eclipse Che' },
        { appName: 'enmasse', appDescription: 'enmasse' }]} />
    </section>
  </div>
);

export default LandingPage;
