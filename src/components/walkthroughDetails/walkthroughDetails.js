import React from 'react';
import PropTypes from 'prop-types';

import { Card, TextContent } from '@patternfly/react-core';
import { connect, reduxActions } from '../../redux';

class WalkthroughDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static validWalkthroughDate(dateString) {
    try {
      // We need to modify the returned string to allow for Firefox compatibility. This just keeps the date section, removes the time and everything after.
      return new Date(dateString.split(' ')[0]).toISOString().slice(0, 10);
    } catch (e) {
      return null;
    }
  }

  render() {
    const { walkthroughInfo } = this.props;

    return (
      <Card className="pf-u-p-lg">
        <TextContent className="integr8ly-walkthrough-resources">
          <h2>About this Solution Pattern</h2>
          <h3>Details</h3>
          <div className="pf-u-pb-sm">
            <div className="pf-u-display-flex pf-u-justify-content-space-between">
              <div>Source: </div>
              <div>
                {walkthroughInfo.type === 'path' ||
                !WalkthroughDetails.validWalkthroughDate(walkthroughInfo.commitDate) ? (
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
                  <div>{WalkthroughDetails.validWalkthroughDate(walkthroughInfo.commitDate)}</div>
                )}
              </div>
            </div>
          </div>
        </TextContent>
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
