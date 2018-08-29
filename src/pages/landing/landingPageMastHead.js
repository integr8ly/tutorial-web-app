import * as React from 'react';
import { Grid, Row, Col } from 'patternfly-react';

const LandingPageMastHead = () => (
  <header className="app-landing-page-integr8ly-masthead">
    <div className="container">
      <h2>Welcome to the <b>Red Hat evaluation enviornment</b></h2>
      <p>The enviornment contains everything you need to explore common integration scenarios. Get started with an 
        end-to-end tutorial or dig into any of the available application services on you own to create custom integrations.</p>
      <p>Everything you build willl reside on the OpenShfit cluster assocated with this environment</p>
    </div>
  </header>
);

export default LandingPageMastHead;
