import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, TabContent } from '@patternfly/react-core';
import { connect, reduxActions } from '../../redux';
import { TutorialDashboard } from '../../components/tutorialDashboard/tutorialDashboard';

class DashboardTabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTabKey: 0
    };

    this.contentRef1 = React.createRef();
    this.contentRef2 = React.createRef();
    this.contentRef3 = React.createRef();

    // Toggle currently active tab
    this.handleTabClick = (event, tabIndex) => {
      this.setState({
        activeTabKey: tabIndex
      });
    };
  }

  render() {
    return (
      <React.Fragment>
        <Tabs activeKey={this.state.activeTabKey} onSelect={this.handleTabClick}>
          <Tab eventKey={0} title="All services" tabContentId="refTab1Section" tabContentRef={this.contentRef1} />
          <Tab
            eventKey={1}
            title="All Solution Patterns"
            tabContentId="refTab2Section"
            tabContentRef={this.contentRef2}
          />
        </Tabs>
        <div>
          {/* <TutorialDashboard /> */}
          <TabContent eventKey={0} id="refTab1Section" ref={this.contentRef1} aria-label="Tab item 1">
            Tab 1 section
          </TabContent>
          <TabContent eventKey={1} id="refTab2Section" ref={this.contentRef2} aria-label="Tab item 2" hidden>
            Tab 2 section
          </TabContent>
        </div>
      </React.Fragment>
    );
  }
}
DashboardTabs.propTypes = {
  walkthroughInfo: PropTypes.object
};

DashboardTabs.defaultProps = {
  walkthroughInfo: { data: {} }
};

const mapDispatchToProps = dispatch => ({
  getWalkthroughInfo: id => dispatch(reduxActions.walkthroughActions.getWalkthroughInfo(id))
});

const mapStateToProps = state => ({
  ...state.walkthroughServiceReducers
});

const ConnectedDashboardTabs = connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardTabs);

export { ConnectedDashboardTabs as default, DashboardTabs };
