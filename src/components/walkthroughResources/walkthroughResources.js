import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Card, TextContent } from '@patternfly/react-core';
import { ChartPieIcon, ExclamationCircleIcon, OnRunningIcon } from '@patternfly/react-icons';
import { getProductDetails } from '../../services/middlewareServices';
import { connect } from '../../redux';
import { SERVICE_TYPES, SERVICE_STATUSES } from '../../redux/constants/middlewareConstants';

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
          icon = <OnRunningIcon className="pf-u-mr-xs integr8ly-state-ready" />;
        } else {
          const productDetails = getProductDetails(app);
          const gaStatusApi = productDetails && productDetails.gaStatus ? productDetails.gaStatus : null;
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
    const provisioningStatus = <ChartPieIcon className="pf-u-mr-xs integr8ly-state-provisioining" />;
    const readyStatus = <OnRunningIcon className="pf-u-mr-xs integr8ly-state-ready" />;
    const unavailableStatus = <ExclamationCircleIcon className="pf-u-mr-xs integr8ly-state-unavailable" />;

    if (!app) {
      return unavailableStatus;
    }

    if (app.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
      if (!app.status || app.status === SERVICE_STATUSES.UNAVAILABLE) {
        return unavailableStatus;
      }
      if (app.status === SERVICE_STATUSES.PROVISIONING) {
        return provisioningStatus;
      }
      if (app.status === SERVICE_STATUSES.PROVISIONED) {
        return readyStatus;
      }
    }

    if (!app.metadata || (app.metadata && app.metadata.deletionTimestamp)) {
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
      resourceList = resources.map(resource => (
        <div key={resource.title}>
          <div className="pf-u-pb-sm">
            {resource.statusIcon}
            <span className="pf-u-mr-md">{resource.title}</span>
            {resource.gaStatus === 'community' ? <Badge isRead>community</Badge> : <span />}
            {resource.gaStatus === 'preview' ? <Badge isRead>preview</Badge> : <span />}
          </div>
          <div dangerouslySetInnerHTML={{ __html: resource.html }} />
        </div>
      ));
    }
    this.setState({ resourceList });
  }

  render() {
    return (
      <Card className="pf-u-p-lg">
        <TextContent className="integr8ly-walkthrough-resources">
          <h3>Resources</h3>
          {this.state.resourceList}
          <div className={this.props.resources.length !== 0 ? 'hidden' : 'show'}>No resources available.</div>
        </TextContent>
      </Card>
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
