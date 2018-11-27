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
    this.buildResourcesList();
  }

  mapServiceLinks() {
    const { resources, middlewareServices } = this.props;
    if (resources.length !== 0) {
      return resources.map(resource => {
        if (!resource.serviceName) {
          return resource;
        }

        let gaStatus = '';
        let icon = '';
        const app = middlewareServices.data[resource.serviceName];

        if (resource.serviceName === 'openshift') {
          gaStatus = '';
          icon = <Icon className="integr8ly-state-ready" type="fa" name="bolt" />;
        } else {
          const gaStatusApi = app.productDetails.gaStatus;
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

  buildResourcesList() {
    const resources = this.mapServiceLinks();
    let resourceList = null;
    if (resources && resources.length > 0) {
      resourceList = resources.map(resource => {
        console.log(resource);
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
            <div className="list-unstyled" dangerouslySetInnerHTML={{ __html: resource.html }} />
          </div>
        );
      });
    }
    this.setState({ resourceList });
  }

  render() {
    return (
      <div>
        <h3 className="integr8ly-helpful-links-heading">Walkthrough Resources</h3>
        {this.state.resourceList}
        <div className={this.props.resources.length !== 0 ? 'hidden' : 'show'}>No resources available.</div>
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
