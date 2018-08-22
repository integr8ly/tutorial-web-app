import * as React from 'react';
import { Grid, Row, Col } from 'patternfly-react';

const LandingPageMastHead = () => (
  <header className="app-landing-page-integr8ly-masthead">
    <div className="container">
      <h1>Welcome to your Red Hat evaluation experience.</h1>
      <h4>will be covering...</h4>
      <Grid>
        <Row>
          <Col xs={12} md={3}>
            <div className="app-landing-page-circle-placeholder" />
            <h4 className="app-landing-page-mast-head-text-center">Your products together in one place.</h4>
          </Col>
          <Col xs={12} md={3}>
            <div className="app-landing-page-circle-placeholder" />
            <h4 className="app-landing-page-mast-head-text-center">Explore tutorials for easy set-up.</h4>
          </Col>
          <Col xs={12} md={3}>
            <div className="app-landing-page-circle-placeholder" />
            <h4 className="app-landing-page-mast-head-text-center">Support in the places you need them.</h4>
          </Col>
          <Col xs={12} md={3}>
            <div className="app-landing-page-circle-placeholder" />
            <h4 className="app-landing-page-mast-head-text-center">Detailed information.</h4>
          </Col>
        </Row>
      </Grid>
    </div>
  </header>
);

export default LandingPageMastHead;
