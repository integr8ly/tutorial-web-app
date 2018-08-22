import React from 'react';
import { CardGrid, Col, Row } from 'patternfly-react';
import TutorialCard from '../tutorialCard/tutorialCard';

const TutorialDashboard = () => (
  <div className="cards-pf">
    <CardGrid matchHeight>
      <Row style={{ marginBottom: '20px', marginTop: '20px' }}>
        <Col xs={6} sm={4} md={4}>
          <TutorialCard title="Steel Thread 0" learnMoreLink="#">
            <p>This will be the description for Steel Thread 0</p>
          </TutorialCard>
        </Col>
        <Col xs={6} sm={4} md={4}>
          <TutorialCard title="Steel Thread 1" learnMoreLink="#">
            <p>This will be the description for Steel Thread 1</p>
          </TutorialCard>
        </Col>
        <Col xs={6} sm={4} md={4}>
          <TutorialCard title="Steel Thread 2" learnMoreLink="#">
            <p>This will be the description for Steel Thread 2</p>
          </TutorialCard>
        </Col>
        <Col xs={6} sm={4} md={4}>
          <TutorialCard title="Steel Thread 3" learnMoreLink="#">
            <p>This will be the description for Steel Thread 3</p>
          </TutorialCard>
        </Col>
        <Col xs={6} sm={4} md={4}>
          <TutorialCard title="Steel Thread 4" learnMoreLink="#">
            <p>This will be the description for Steel Thread 4</p>
          </TutorialCard>
        </Col>
        <Col xs={6} sm={4} md={4}>
          <TutorialCard title="Steel Thread 5" learnMoreLink="#">
            <p>This will be the description for Steel Thread 5</p>
          </TutorialCard>
        </Col>
      </Row>
    </CardGrid>
  </div>
);

export default TutorialDashboard;
