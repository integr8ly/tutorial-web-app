import React from 'react';
import { withRouter } from 'react-router';
import { Router } from './router/router';
import I18nProvider from './components/i18nProvider/i18nProvider';
import Authentication from './components/authentication/authenication';

class App extends React.Component {
  state = { locale: 'en' };

  render() {
    return (
      <React.Fragment>
        <I18nProvider locale={this.state.locale}>
          <Authentication>
            <Router />
          </Authentication>
        </I18nProvider>
      </React.Fragment>
    );
  }
}

export default withRouter(App);
