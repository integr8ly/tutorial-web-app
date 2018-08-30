import * as React from 'react';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import LandingPageMastHead from './landingPageMastHead';
import InstalledAppsView from '../../components/installedAppsView/InstalledAppsView';

const LandingPage = () => (
  <div>
    <LandingPageMastHead />
    <section className="app-landing-page-tutorial-dashboard-section">
      <TutorialDashboard className="app-landing-page-tutorial-dashboard-section-left" />
      <InstalledAppsView
        className="app-landing-page-tutorial-dashboard-section-right"
        apps={[
          {
            appName: 'Red Hat 3scale API Management Platform',
            appDescription:
              'A portal that allows customers to define desired authentication methods, set rate limits, get analytics on the usage of their APIs, and create a developer portal for their API consumers.',
            appLink: 'https://www.redhat.com/en/technologies/jboss-middleware/3scale'
          },
          {
            appName: 'Red Hat Fuse',
            appDescription:
              'An open source project for managed, self-service messaging on Kubernetes. AMQ Online (Tech Preview) and Red Hat AMQ Broker are available in this environment.',
            appLink: 'https://www.redhat.com/en/technologies/jboss-middleware/fuse'
          },
          {
            appName: 'Red Hat Fuse Online',
            appDescription:
              'An integration Platform-as-a-Service (iPaaS) solution that makes it easy for business users to collaborate with integration experts and application developers.  Both low-code environment and developer-focused features are available in this environment.',
            appLink: 'https://www.redhat.com/en/technologies/jboss-middleware/fuse-online'
          },
          {
            appName: 'Red Hat OpenShift Application Runtimes',
            appDescription:
              'A collection of cloud-native runtimes for developing Java or JavaScript applications on OpenShift.',
            appLink: 'https://www.openshift.com/'
          },
          {
            appName: 'Eclipse Che',
            appDescription: 'A developer workspace server and cloud IDE.',
            appLink: 'https://www.eclipse.org/che/'
          },
          {
            appName: 'EnMasse',
            appDescription: 'Managed, self-service messaging on Kubernetes.',
            appLink: 'http://enmasse.io/'
          }
        ]}
      />
    </section>
  </div>
);

export default LandingPage;
