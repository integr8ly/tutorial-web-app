import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { BackgroundImage, BackgroundImageSrc } from '@patternfly/react-core';
import { routes } from '../routes';
import { buildProvisioningScreen } from '../components/provisioning/provisioning';

class Router extends React.Component {
  static buildProvisioningComponent(component) {
    return buildProvisioningScreen(component);
  }

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

        if (item.to === '/oauth/callback') {
          return (
            <Route exact={item.hasParameters || item.exact} key={item.to} path={item.to} component={item.component} />
          );
        }

        return (
          <Route
            exact={item.hasParameters || item.exact}
            key={item.to}
            path={item.to}
            component={Router.buildProvisioningComponent(item.component)}
          />
        );
      }),
      redirectRoot
    };
  }

  render() {
    const { renderRoutes, redirectRoot } = Router.renderRoutes();

    const bgImages = {
      [BackgroundImageSrc.lg]: '/assets/images/pfbg_1200.jpg',
      [BackgroundImageSrc.sm]: '/assets/images/pfbg_768.jpg',
      [BackgroundImageSrc.sm2x]: '/assets/images/pfbg_768@2x.jpg',
      [BackgroundImageSrc.xs]: '/assets/images/pfbg_576.jpg',
      [BackgroundImageSrc.xs2x]: '/assets/images/pfbg_576@2x.jpg',
      [BackgroundImageSrc.filter]: '/assets/images/background-filter.svg#image_overlay'
    };

    return (
      <div className="integr8ly-container">
        <BackgroundImage src={bgImages} />
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
