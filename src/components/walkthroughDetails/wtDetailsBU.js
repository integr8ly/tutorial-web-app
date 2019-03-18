import React from 'react';
import axios from 'axios';
// import PropTypes from 'prop-types';

import { Card, CardBody, TextContent } from '@patternfly/react-core';
// import { ChartPieIcon, ExclamationCircleIcon, OnRunningIcon } from '@patternfly/react-icons';
// import { connect } from '../../redux';

class WalkthroughDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceUrl: '',
      sourceDate: ''
    };
  }

  // getCommitDate = () => {
  //   const wtRepo = "https://api.github.com/repos/integr8ly/tutorial-web-app-walkthroughs";
  //   // let { data } = {};
  //   axios.get(wtRepo).then(response => {
  //     if (!response.error) {
  //       const id = response.id;
  //     } else {
  //       lastCommit = 'Unknown';
  //     }
  //     return lastCommit;
  //   });
  // };

  getGitHubURL = () => {
    const repoUrl = 'https://github.com/integr8ly/tutorial-web-app-walkthroughs';
    return repoUrl;
  };

  getSourceDate = () => {
    let repoDate = '2019-03-08 17:12:10 -0800';
    repoDate = repoDate.slice(0, 11);
    return repoDate;
  };

  // formatDate = date => {
  //   new Intl.DateTimeFormat('en-US', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: '2-digit'
  //   }).format(date);
  //   return date;
  // };

  // getSourceDate = url => {
  //   let repoDate = [];
  //   // let sourceDate = '';
  //   if (url.includes('https://github.com', 0)) {
  //     const formattedUrl = this.formatApiCallFromUrl(url);
  //     console.log(formattedUrl);

  //     axios
  //       .get(formattedUrl)
  //       .then(response => {
  //         if (!response.error) {
  //           // console.log(response);
  //           repoDate = response.data.pushed_at;
  //           // this.state.sourceDate = <p>repoDate</p>;
  //           console.log(repoDate);
  //         } else {
  //           // this.state.sourceDate = <p>Unknown</p>;
  //         }
  //         // return sourceDate;
  //       })
  //       .catch(error => {
  //         if (error.response) {
  //           console.log(error.response.data);
  //           console.log(error.response.status);
  //           console.log(error.response.headers);
  //         }
  //       });
  //   } else {
  //     console.log('Bad URL');
  //   }
  // };

  // formatApiCallFromUrl = url => {
  //   const api = 'api.';
  //   const repo = '/repos';
  //   const pos = 8;
  //   const pos2 = 22;
  //   url = [url.slice(0, pos), api, url.slice(pos)].join('');
  //   url = [url.slice(0, pos2), repo, url.slice(pos2)].join('');
  //   // console.log(url);
  //   return url;
  // };

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

  componentDidMount() {
    // this.getSourceDate(this.getGitHubURL());
    // this.getSourceDate('https://github.com/integr8ly/tutorial-web-app-walkthroughs');
    // this.buildResourcesList();
  }

  // mapServiceLinks() {
  //   const { resources, middlewareServices } = this.props;
  //   if (resources.length !== 0) {
  //     return resources.map(resource => {
  //       if (!resource.serviceName) {
  //         return resource;
  //       }

  //       let gaStatus = '';
  //       let icon = '';
  //       const app = middlewareServices.data[resource.serviceName];

  //       if (resource.serviceName === 'openshift') {
  //         gaStatus = '';
  //         icon = <OnRunningIcon className="pf-u-mr-xs integr8ly-state-ready" />;
  //       } else {
  //         const gaStatusApi = app.productDetails.gaStatus;
  //         const statusIcon = WalkthroughDetails.assignSerivceIcon(app);

  //         if (gaStatusApi) {
  //           gaStatus = gaStatusApi;
  //         }
  //         if (statusIcon) {
  //           icon = statusIcon;
  //         }
  //       }

  //       resource.gaStatus = gaStatus;
  //       resource.statusIcon = icon;
  //       return resource;
  //     });
  //   }
  //   return null;
  // }

  // buildResourcesList() {
  //   const resources = this.mapServiceLinks();
  //   let resourceList = null;
  //   if (resources && resources.length > 0) {
  //     resourceList = resources.map(resource => (
  //       <div key={resource.title}>
  //         <div className="pf-u-pb-sm">
  //           {resource.statusIcon}
  //           <span className="pf-u-mr-md">{resource.title}</span>
  //           {resource.gaStatus === 'community' ? <Label isCompact>community</Label> : <span />}
  //           {resource.gaStatus === 'preview' ? <Label isCompact>preview</Label> : <span />}
  //         </div>
  //         <div dangerouslySetInnerHTML={{ __html: resource.html }} />
  //       </div>
  //     ));
  //   }
  //   this.setState({ resourceList });
  // }

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

// WalkthroughDetails.propTypes = {
//   resources: PropTypes.array,
//   middlewareServices: PropTypes.object
// };

// WalkthroughDetails.defaultProps = {
//   resources: [],
//   middlewareServices: { data: {} }
// };

// const mapStateToProps = state => ({
//   ...state.middlewareReducers
// });

// const ConnectedWalkthroughDetails = connect(mapStateToProps)(WalkthroughDetails);

export { WalkthroughDetails as default, WalkthroughDetails };
