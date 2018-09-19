import React from 'react';
import { CardGrid, Col, Row, Icon } from 'patternfly-react';
import TutorialCard from '../tutorialCard/tutorialCard';

const TutorialDashboard = () => (
  <div className="app-tutorial-dashboard panel panel-default">
    <div className="panel-heading panel-title">
      <h2>Start with a walkthrough</h2>
      <div>5 walkthroughs</div>
    </div>
    <div className="panel-content cards-pf">
      <CardGrid matchHeight style={{ width: 'calc(100% - 40px)' }}>
        <Row>
          <Col xs={12} sm={4}>
            <TutorialCard
              title="Integrating event-driven and API-driven applications"
              getStartedLink="/tutorial/0"
              getStartedText="Get Started"
              getStartedIcon={<Icon type="fa" name="arrow-circle-o-right" className="fa-lg" />}
              users={[TutorialCard.users.OPERATOR, TutorialCard.users.DEVELOPER]}
              minsIcon={<Icon type="fa" name="clock-o" className="fa-lg" style={{ paddingRight: 5 }} />}
              mins={40}
            >
              <p>
                Build a simple REST-based integration that enables a new fruit type to be added to an inventory list for
                a fictional grocery list.
              </p>
            </TutorialCard>
          </Col>
          <Col xs={12} sm={4}>
            <TutorialCard
              title="Develop an API from beginning to end"
              getStartedLink="#"
              getStartedText=""
              getStartedIcon={<span>&nbsp;</span>}
              users={[TutorialCard.users.DEVELOPER]}
              minsIcon={<Icon type="fa" name="clock-o" className="fa-lg" style={{ paddingRight: 5 }} />}
              mins={0}
            >
              <p>Coming soon.</p>
            </TutorialCard>
          </Col>
          <Col xs={12} sm={4}>
            <TutorialCard
              title="Create a greenfield-brownfield facade"
              getStartedLink="#"
              getStartedText=""
              getStartedIcon={<span>&nbsp;</span>}
              users={[TutorialCard.users.OPERATOR, TutorialCard.users.DEVELOPER]}
              minsIcon={<Icon type="fa" name="clock-o" className="fa-lg" style={{ paddingRight: 5 }} />}
              mins={0}
            >
              <p>Coming soon.</p>
            </TutorialCard>
          </Col>
          <Col xs={12} sm={4}>
            <TutorialCard
              title="Build a microservice API gateway"
              getStartedLink="#"
              getStartedText=""
              getStartedIcon={<span>&nbsp;</span>}
              users={[TutorialCard.users.OPERATOR, TutorialCard.users.DEVELOPER]}
              minsIcon={<Icon type="fa" name="clock-o" className="fa-lg" style={{ paddingRight: 5 }} />}
              mins={0}
            >
              <p>Coming soon.</p>
            </TutorialCard>
          </Col>
          <Col xs={12} sm={4}>
            <TutorialCard
              title="Create a REST facade to existing SOAP-based web service"
              getStartedLink="#"
              getStartedText=""
              getStartedIcon={<span>&nbsp;</span>}
              users={[TutorialCard.users.OPERATOR]}
              minsIcon={<Icon type="fa" name="clock-o" className="fa-lg" style={{ paddingRight: 5 }} />}
              mins={0}
            >
              <p>Coming soon.</p>
            </TutorialCard>
          </Col>
        </Row>
      </CardGrid>
    </div>
  </div>
);

export default TutorialDashboard;
