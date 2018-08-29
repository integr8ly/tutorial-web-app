import React from 'react';
import { Grid, Row, Col } from 'patternfly-react';
import PropTypes from 'prop-types';

class InstalledAppsView extends React.Component {
  state = {
    currentApp: undefined
  };

  constructor(props) {
    super(props);
    this.state.currentApp = 0;
    this.handleAppNameClicked = this.handleAppNameClicked.bind(this);
  }

  handleAppNameClicked(e) {
    this.setState({ currentApp: e.target.value });
  }
  createMasterList(apps) {
    const masterList = apps.map((app, index) => (
      <li onClick={this.handleAppNameClicked} key={`${app.appName}_${index}`} value={index}>
        {app.appName}
      </li>
    ));
    return <ul>{masterList}</ul>;
  }

  render() {
    const appNameList = this.createMasterList(this.props.apps);
    return (
      <div className="container">
        <Grid>
          <Row>
            <Col xs={12} md={6}>
              {appNameList}
            </Col>
            <Col xs={12} md={6}>
              <h1>{this.props.apps[this.state.currentApp].appName}</h1>
              <p>{this.props.apps[this.state.currentApp].appDescription}</p>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

InstalledAppsView.propTypes = {
  apps: PropTypes.arrayOf(
    PropTypes.shape({
      appName: PropTypes.string,
      appDescription: PropTypes.string
    })
  ).isRequired
};

export default InstalledAppsView;