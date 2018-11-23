import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';
import { connect } from '../../redux';
import { getDashboardUrl } from '../../common/serviceInstanceHelpers';

class WalkthroughResources extends React.Component {
  mapServiceLinks() {
    const { resources, middlewareServices } = this.props;
    if (resources.length !== 0) {
      return resources.map(resource => {
        let url = '';
        let gaStatus = '';
        let icon = '';
        const app = middlewareServices.data[resource.serviceName];

        if (resource.serviceName === 'openshift') {
          url = `${window.OPENSHIFT_CONFIG.masterUri}/console`;
          gaStatus = '';
          icon = <Icon className="integr8ly-state-ready" type="fa" name="bolt" />;
        } else {
          const gaStatusApi = app.productDetails.gaStatus;
          url = getDashboardUrl(app);
          const statusIcon = WalkthroughResources.assignSerivceIcon(app);

          if (gaStatusApi) {
            gaStatus = gaStatusApi;
          }
          if (statusIcon) {
            icon = statusIcon;
          }
        }

        resource.gaStatus = gaStatus;
        resource.statusIcon = icon;

        resource.links.forEach(link => {
          if (link.type === 'console') {
            link.url = url;
          }
        });
        return resource;
      });
    }
    return null;
  }

  static assignSerivceIcon(app) {
    const provisioningStatus = <Icon className="integr8ly-state-provisioining" type="fa" name="chart-pie" />;
    const readyStatus = <Icon className="integr8ly-state-ready" type="fa" name="bolt" />;
    const unavailableStatus = <Icon className="integr8ly-state-unavailable" type="pf" name="error-circle-o" />;

    if (app.metadata && app.metadata.deletionTimestamp) {
      return unavailableStatus;
    }

    if (app.status && app.status.conditions && app.status.conditions[0]) {
      if (app.status.provisionStatus === 'NotProvisioned') {
        return unavailableStatus;
      }
      return app.status.conditions[0].status === 'True' ? readyStatus : provisioningStatus;
    }
    return provisioningStatus;
  }

  renderHeading() {
    if (!this.props.noHeadline) {
      return <h4 className="integr8ly-helpful-links-heading">Walkthrough Resources</h4>;
    }
    return null;
  }

  render() {
    return (
      <div>
        {this.renderHeading()}
        {this.props.resources.map((resource, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: resource.html }} />
        ))}
        <div className={this.props.resources.length !== 0 ? 'hidden' : 'show'}>No resources available.</div>
      </div>
    );
  }
}

WalkthroughResources.propTypes = {
  resources: PropTypes.array,
  middlewareServices: PropTypes.object,
  noHeadline: PropTypes.bool
};

WalkthroughResources.defaultProps = {
  resources: [],
  middlewareServices: { data: {} },
  noHeadline: false
};

const mapStateToProps = state => ({
  ...state.middlewareReducers
});

const ConnectedWalkthroughResources = connect(mapStateToProps)(WalkthroughResources);

export { ConnectedWalkthroughResources as default, WalkthroughResources };
