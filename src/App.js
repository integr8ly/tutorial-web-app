import React from 'react';
import { withRouter } from 'react-router';
import { Router } from './router/router';
import I18nProvider from './components/i18nProvider/i18nProvider';
import AboutModal from './components/aboutModal/aboutModal';
import Authentication from './components/authentication/authenication';
import Masthead from './components/masthead/masthead';

class App extends React.Component {
  state = { locale: 'de' };

  render() {
    return (
      <React.Fragment>
        <I18nProvider locale={this.state.locale}>
          <Authentication>
            <div className="layout-pf layout-pf-fixed">
              <Masthead />
              <div>
                <AboutModal />
                <Router />
              </div>
            </div>
          </Authentication>
        </I18nProvider>
      </React.Fragment>
    );
  }
}

export default withRouter(App);
