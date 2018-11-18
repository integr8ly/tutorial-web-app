import React from 'react';
import PropTypes from 'prop-types';
import { connect } from '../../redux';
import { getDashboardUrl } from '../../common/serviceInstanceHelpers';

class WalkthroughResources extends React.Component {
  mapServiceLinks() {
    const { resources, middlewareServices } = this.props;
    if (resources.length !== 0) {
      return resources.map(resource => {
        let url = '';
        let gaStatus = '';
        let serviceStatus = '';

        if (resource.serviceName === 'openshift') {
          url = `${window.OPENSHIFT_CONFIG.masterUri}/console`;
          serviceStatus = true;
          gaStatus = '';
        } else {
          const serviceStatusApi = middlewareServices.data[resource.serviceName].status.conditions[0].status;
          const gaStatusApi = middlewareServices.data[resource.serviceName].productDetails.gaStatus;
          url = getDashboardUrl(middlewareServices.data[resource.serviceName]);

          if (serviceStatusApi) {
            serviceStatus = serviceStatusApi;
          }
          if (gaStatusApi) {
            gaStatus = gaStatusApi;
          }
        }

        resource.serviceStatus = serviceStatus;
        resource.gaStatus = gaStatus;

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

  render() {
    return (
      <div>
        <h4 className="integr8ly-helpful-links-heading">Walkthrough Resources</h4>
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
