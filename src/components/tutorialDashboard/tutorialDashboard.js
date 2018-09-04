import React from 'react';
import { CardGrid, Col, Row } from 'patternfly-react';
import TutorialCard from '../tutorialCard/tutorialCard';

const TutorialDashboard = () => (
  <div className=" app-tutorial-dashboard panel panel-default">
    <div className="panel-heading panel-title">
      <h2>
        Start with a walkthrough
      </h2>
      <div>5 walkthroughs</div>
    </div>
    <div className="panel-content cards-pf">
      <CardGrid matchHeight style={{ width: 'calc(100% - 40px)' }}>
        <Row>
          <Col xs={12} sm={4}>
            <TutorialCard
              title="Integrating two RESTful web services"
              getStartedLink="/tutorial/0"
              users={[TutorialCard.users.OPERATOR, TutorialCard.users.DEVELOPER]}
              mins={40}
            >
              <p>
                Build a simple REST-based integration that enables a new fruit type to be added to an inventory list for
                a fictional grocery list
              </p>
            </TutorialCard>
          </Col>
          <Col xs={12} sm={4}>
            <TutorialCard
              title="Develop an API from beginning to end"
              getStartedLink="#"
              users={[TutorialCard.users.DEVELOPER]}
              mins={28}
            >
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </p>
            </TutorialCard>
          </Col>
          <Col xs={12} sm={4}>
            <TutorialCard
              title="Create a greenfield-brownfield facade"
              getStartedLink="#"
              users={[TutorialCard.users.OPERATOR, TutorialCard.users.DEVELOPER]}
              mins={15}
            >
              <p>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat magna aliqua.
              </p>
            </TutorialCard>
          </Col>
          <Col xs={12} sm={4}>
            <TutorialCard
              title="Build a microservice API gateway"
              getStartedLink="#"
              users={[TutorialCard.users.OPERATOR, TutorialCard.users.DEVELOPER]}
              mins={34}
            >
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </p>
            </TutorialCard>
          </Col>
          <Col xs={12} sm={4}>
            <TutorialCard
              title="Create a REST facade to existing SOAP-based web service"
              getStartedLink="#"
              users={[TutorialCard.users.OPERATOR]}
              mins={45}
            >
              <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.</p>
            </TutorialCard>
          </Col>
        </Row>
      </CardGrid>
    </div>
  </div>
);

export default TutorialDashboard;
