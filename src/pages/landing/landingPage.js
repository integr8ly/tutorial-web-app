import * as React from 'react';
import TutorialDashboard from '../../components/tutorialDashboard/tutorialDashboard';
import LandingPageMastHead from './landingPageMastHead';

const LandingPage = () => (
  <div>
    <LandingPageMastHead />
    <section className="app-landing-page-tutorial-dashboard-section">
      <div className="container">
        <h2 className="app-landing-page-white-text">Solve problems with tutorials</h2>
        <TutorialDashboard className="app-landing-page-dashboard" />
      </div>
    </section>
  </div>
);

export default LandingPage;
