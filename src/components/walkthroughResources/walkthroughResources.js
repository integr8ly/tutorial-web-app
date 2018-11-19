import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';
import { connect } from '../../redux';
import { getDashboardUrl } from '../../common/serviceInstanceHelpers';

class WalkthroughResources extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resourceList: null
    };
  }

  componentDidMount() {
    this.buildResourceList();
  }

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
          const statusIcon = this.assignSerivceIcon(app);

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

  assignSerivceIcon(app) {
    const { resources, middlewareServices } = this.props;
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

  buildResourceList() {
    const resources = this.mapServiceLinks();
    let resourceList = null;

    if (resources && resources.length !== 0) {
      resourceList = resources.map(resource => {
        const resourceLinks = resource.links.map(link => (
          <li key={link.name}>
            <a href={link.url} target="top">
              {link.name}
            </a>
          </li>
        ));

        return (
          <div key={resource.title}>
            <h4 className="integr8ly-helpful-links-product-title">
              {resource.statusIcon}
              &nbsp;
              {resource.title}
              &nbsp;
              {resource.gaStatus === 'community' ? (
                <span className="integr8ly-label-community integr8ly-walkthrough-labels-tag">community</span>
              ) : (
                <span />
              )}
              {resource.gaStatus === 'preview' ? (
                <span className="integr8ly-label-preview integr8ly-walkthrough-labels-tag">preview</span>
              ) : (
                <span />
              )}
            </h4>
            <ul className="list-unstyled">{resourceLinks}</ul>
          </div>
        );
      });
    }
    this.setState({ resourceList });
  }

  render() {
    return (
      <div>
        <h4 className="integr8ly-helpful-links-heading">Walkthrough Resources</h4>
        {this.state.resourceList}
        <div className={this.state.resourceList ? 'hidden' : 'show'}>No resources available.</div>
      </div>
    );
  }
}

WalkthroughResources.propTypes = {
  resources: PropTypes.array,
  middlewareServices: PropTypes.object
};

WalkthroughResources.defaultProps = {
  resources: [],
  middlewareServices: { data: {} }
};

const mapStateToProps = state => ({
  ...state.middlewareReducers
});

const ConnectedWalkthroughResources = connect(mapStateToProps)(WalkthroughResources);

export { ConnectedWalkthroughResources as default, WalkthroughResources };
