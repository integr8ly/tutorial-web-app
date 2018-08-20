import React from 'react';
import { withRouter } from 'react-router';
import { Router } from './router/router';
import AboutModal from './components/aboutModal/aboutModal';
import Authentication from './components/authentication/authenication';
import Masthead from './components/masthead/masthead';

const App = () => (
  <React.Fragment>
    <Authentication>
      <div className="layout-pf layout-pf-fixed">
        <Masthead />
        <div>
          <AboutModal />
          <Router />
        </div>
      </div>
    </Authentication>
  </React.Fragment>
);

export default withRouter(App);
