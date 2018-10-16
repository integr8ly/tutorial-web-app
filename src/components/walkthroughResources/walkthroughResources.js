import React from 'react';
import PropTypes from 'prop-types';
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
        if (resource.serviceName === 'openshift') {
          url = `${window.OPENSHIFT_CONFIG.masterUri}/console`;
        } else {
          url = getDashboardUrl(middlewareServices.data[resource.serviceName]);
        }

        resource.links.forEach(link => {
          if (link.name === 'Open Console') {
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
        let resourceLinks;
        if (resource) {
          resourceLinks = resource.links.map(link => (
            <li key={link.name}>
              <a href={link.url} target="top">
                {link.name}
              </a>
            </li>
          ));
          return (
            <div key={resource.title}>
              <h4 className="integr8ly-helpful-links-product-title">{resource.title}</h4>
              <ul className="list-unstyled">{resourceLinks}</ul>
            </div>
          );
        }
        return resourceLinks;
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
