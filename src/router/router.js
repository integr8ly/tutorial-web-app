import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { routes } from '../routes';

class Router extends React.Component {
  static renderRoutes() {
    let redirectRoot = null;

    return {
      renderRoutes: routes().map(item => {
        if (item.disabled) {
          return null;
        }

        if (item.redirect === true) {
          redirectRoot = <Redirect from="/" to={item.to} />;
        }

        return (
          <Route exact={item.hasParameters || item.exact} key={item.to} path={item.to} component={item.component} />
        );
      }),
      redirectRoot
    };
  }

  render() {
    const { renderRoutes, redirectRoot } = Router.renderRoutes();

    return (
      <div className="app-content">
        <Switch>
          {renderRoutes}
          {redirectRoot}
        </Switch>
      </div>
    );
  }
}

export { Router };

export default Router;
