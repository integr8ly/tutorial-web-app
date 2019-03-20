import React from 'react';
import PropTypes from 'prop-types';

import { Card, CardBody, TextContent } from '@patternfly/react-core';
import { connect, reduxActions } from '../../redux';

class WalkthroughDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

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
      <a href={this.url} target="_blank" rel="noopener noreferrer">
        {this.url === 'https://github.com/integr8ly/tutorial-web-app-walkthroughs' ? 'Red Hat' : 'Community'}
      </a>
    );

    return sourceLabel;
  };

  componentDidMount() {
    // const { walkthroughInfo } = this.props.getWalkthroughInfo();
    // this.props.getWalkthroughInfo();
  }

  render() {
    // const { walkthroughInfo } = this.props;
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

WalkthroughDetails.propTypes = {
  getWalkthroughInfo: PropTypes.func,
  walkthroughInfo: PropTypes.object
};

WalkthroughDetails.defaultProps = {
  getWalkthroughInfo: null,
  walkthroughInfo: { data: {} }
};

const mapDispatchToProps = dispatch => ({
  getWalkthroughInfo: () => dispatch(reduxActions.walkthroughActions.getWalkthroughInfo())
});

const mapStateToProps = state => ({
  ...state.walkthroughServiceReducers
});

const ConnectedWalkthroughDetails = connect(
  mapStateToProps,
  mapDispatchToProps
)(WalkthroughDetails);

export { ConnectedWalkthroughDetails as default, WalkthroughDetails };
