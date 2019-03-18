import React from 'react';

import { Card, CardBody, TextContent } from '@patternfly/react-core';

class WalkthroughDetails extends React.Component {
  getGitHubURL = () => {
    const repoUrl = 'https://github.com/integr8ly/tutorial-web-app-walkthroughs';
    return repoUrl;
  };

  getSourceDate = () => {
    let repoDate = '2019-03-08 17:12:10 -0800';
    repoDate = repoDate.slice(0, 11);
    return repoDate;
  };

  getSourceLabel = url => {
    let sourceLabel = '';
    this.url = url;

    sourceLabel = (
      <a href={this.url} target="_blank">
        {this.url === 'https://github.com/integr8ly/tutorial-web-app-walkthroughs' ? 'Red Hat' : 'Custom'}
      </a>
    );

    return sourceLabel;
  };

  componentDidMount() {}

  render() {
    return (
      <Card>
        <CardBody>
          <TextContent className="integr8ly-walkthrough-resources pf-u-pl-md">
            <h2>About this walkthrough</h2>
            <h3>Details</h3>
            <div className="pf-u-pb-sm">
              <div className="pf-u-display-flex pf-u-justify-content-space-between">
                <div>Source</div>
                <div>{this.getSourceLabel(this.getGitHubURL())}</div>
              </div>
              <div className="pf-u-display-flex pf-u-justify-content-space-between">
                <div>Last updated</div>
                <div>{this.getSourceDate(this.getGitHubURL())}</div>
              </div>
            </div>
          </TextContent>
        </CardBody>
      </Card>
    );
  }
}

export { WalkthroughDetails as default, WalkthroughDetails };
