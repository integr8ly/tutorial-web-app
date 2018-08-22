import React from 'react';
import { Alert, Grid } from 'patternfly-react';

const logo = require('../../logo.svg');

interface State {
  alertVisible: boolean;
}

class HomePage extends React.Component<any, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      alertVisible: true
    };
  }

  dismissAlert = () => {
    this.setState({ alertVisible: false });
  };

  render() {
    return (
      <Grid fluid>
        <div className="page-header">
          <h2>Welcome to PatternFly React Product Demo App!</h2>
        </div>
        <div className="app-body">
          {this.state.alertVisible && (
            <Alert type="success" onDismiss={this.dismissAlert}>
              <span>Well done! You&apos;ve installed this demo correctly.</span>
            </Alert>
          )}
          <div className="app-intro">
            <img src={logo} className="app-logo" alt="logo" />
            <h2>Welcome to PatternFly React</h2>
          </div>
          <p className="app-paragraph">
            To get started, edit <code>src/app.js</code> and save to reload.
          </p>
        </div>
      </Grid>
    );
  }
}

export default HomePage;
