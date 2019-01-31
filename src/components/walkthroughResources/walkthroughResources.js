import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, TextContent, Text, TextVariants } from '@patternfly/react-core';
import { connect } from '../../redux';

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
          icon = <i className="fas fa-bolt integr8ly-state-ready" />;
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
    const provisioningStatus = <i className="fas fa-chart-pie integr8ly-state-provisioining" />;
    const readyStatus = <i className="fas fa-bolt integr8ly-state-ready" />;
    const unavailableStatus = <i className="fas fa-exclamation-circle integr8ly-state-unavailable" />;

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
      resourceList = resources.map(resource => (
        <div key={resource.title}>
          <h4>
            <span className="pf-u-mr-xs">{resource.statusIcon}</span>
            <span className="pf-u-mr-md">{resource.title}</span>
            {resource.gaStatus === 'community' ? (
              <span className="integr8ly-label integr8ly-walkthrough-labels-tag">community</span>
            ) : (
              <span />
            )}
            {resource.gaStatus === 'preview' ? (
              <span className="integr8ly-label integr8ly-walkthrough-labels-tag">preview</span>
            ) : (
              <span />
            )}
          </h4>
          <div dangerouslySetInnerHTML={{ __html: resource.html }} />
        </div>
      ));
    }
    this.setState({ resourceList });
  }

  render() {
    return (
      <Card>
        <CardBody>
          <TextContent className="integr8ly-walkthrough-resources pf-u-pl-md">
            <Text component={TextVariants.h2}>Walkthrough Resources</Text>
            {this.state.resourceList}
            <div className={this.props.resources.length !== 0 ? 'hidden' : 'show'}>No resources available.</div>
          </TextContent>
        </CardBody>
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
