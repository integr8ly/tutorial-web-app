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
    // this.buildResourceList();
  }

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
              <Icon
                className={resource.serviceStatus ? 'integr8ly-state-ready' : 'integr8ly-state-unavailable'}
                type="pf"
                name={resource.serviceStatus ? 'on-running' : 'error-circle-o'}
              />
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
