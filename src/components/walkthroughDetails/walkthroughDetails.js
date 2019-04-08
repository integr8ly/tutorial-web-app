import React from 'react';
import PropTypes from 'prop-types';

import { Card, CardBody, TextContent } from '@patternfly/react-core';
import { connect, reduxActions } from '../../redux';

class WalkthroughDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { walkthroughInfo } = this.props;
    return (
      <Card>
        <CardBody>
          <TextContent className="integr8ly-walkthrough-resources pf-u-pl-md">
            <h2>About this walkthrough</h2>
            <h3>Details</h3>
            <div className="pf-u-pb-sm">
              <div className="pf-u-display-flex pf-u-justify-content-space-between">
                <div>Source: </div>
                <div>
                  {walkthroughInfo.type === 'path' ? (
                    <div>---</div>
                  ) : (
                    <div>
                      <a href={walkthroughInfo.gitUrl} target="_blank" rel="noopener noreferrer">
                        {walkthroughInfo.gitUrl.includes('https://github.com/integr8ly/') ? 'Red Hat' : 'Community'}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="pf-u-display-flex pf-u-justify-content-space-between">
                <div>Last updated: </div>
                <div>
                  {walkthroughInfo.type === 'path' ? (
                    <div>---</div>
                  ) : (
                    <div>{new Date(walkthroughInfo.commitDate).toISOString().slice(0, 10)}</div>
                  )}
                </div>
              </div>
            </div>
          </TextContent>
        </CardBody>
      </Card>
    );
  }
}

WalkthroughDetails.propTypes = {
  walkthroughInfo: PropTypes.object
};

WalkthroughDetails.defaultProps = {
  walkthroughInfo: { data: {} }
};

const mapDispatchToProps = dispatch => ({
  getWalkthroughInfo: id => dispatch(reduxActions.walkthroughActions.getWalkthroughInfo(id))
});

const mapStateToProps = state => ({
  ...state.walkthroughServiceReducers
});

const ConnectedWalkthroughDetails = connect(
  mapStateToProps,
  mapDispatchToProps
)(WalkthroughDetails);

export { ConnectedWalkthroughDetails as default, WalkthroughDetails };
