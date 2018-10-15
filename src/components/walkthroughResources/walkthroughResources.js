import React from 'react';
import PropTypes from 'prop-types';

const WalkthroughResources = props => {
  const { resources } = props;
  let resourceList = null;
  if (resources.length !== 0) {
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
          <h4 className="integr8ly-helpful-links-product-title">{resource.title}</h4>
          <ul className="list-unstyled">{resourceLinks}</ul>
        </div>
      );
    });
  }

  return (
    <div>
      <h4 className="integr8ly-helpful-links-heading">Walkthrough Resources</h4>
      {resourceList}
      <div className={resourceList ? 'hidden' : 'show'}>No resources available.</div>
    </div>
  );
};

WalkthroughResources.propTypes = {
  resources: PropTypes.array
};

WalkthroughResources.defaultProps = {
  resources: []
};

export default WalkthroughResources;
