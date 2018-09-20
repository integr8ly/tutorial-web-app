import React from 'react';
import { Card, CardBody, CardFooter, CardTitle, Icon, noop } from 'patternfly-react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

/** User enums for the users prop */
const users = {
  DEVELOPER: 'Developer',
  OPERATOR: 'Operator'
};

const TutorialCard = props => {
  let userList;
  // eslint-disable-next-line array-callback-return
  props.users.map(user => {
    if (userList) {
      userList = `${userList}, ${user}`;
    } else {
      userList = user;
    }
  });

  return (
    <Card
      matchHeight
      className="app-tutorial-card"
      onClick={e => {
        e.preventDefault();
        props.history.push(props.getStartedLink);
      }}
    >
      <CardTitle>
        <div> {props.title} </div>
      </CardTitle>
      <CardBody>
        {props.children}
        <div className="app-tutorial-card-user-types">
          <Icon type="pf" name="user" /> {userList}
        </div>
      </CardBody>
      <CardFooter className="app-tutorial-card-pf-footer">
        <a className="app-tutorial-card-pf-footer-get-started" href={props.getStartedLink}>
          {props.getStartedIcon}
          <span>{props.getStartedText}</span>
        </a>
        <div className="app-tutorial-card-pf-footer-time-to-complete">
          {props.minsIcon}
          {props.mins} <span>Minutes</span>
        </div>
      </CardFooter>
    </Card>
  );
};

TutorialCard.users = users;

TutorialCard.propTypes = {
  /** Content rendered inside the tutorial card  */
  children: PropTypes.node.isRequired,
  /** Title of the tutorial */
  title: PropTypes.string.isRequired,
  /** Link to page that explains the the tutorial in more detail */
  getStartedLink: PropTypes.string.isRequired,
  /** Text for the Get Started link - variable */
  getStartedText: PropTypes.string.isRequired,
  /** Icon for the Get Started link */
  getStartedIcon: PropTypes.object.isRequired,
  /** Users that apply to this tutorial */
  users: PropTypes.arrayOf(PropTypes.oneOf(Object.keys(users))).isRequired,
  /** Mins to complete the tutorial */
  mins: PropTypes.number.isRequired,
  /** Icon for the minutes label */
  minsIcon: PropTypes.object.isRequired,
  /** router history */
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

TutorialCard.defaultProps = {
  history: {
    push: noop
  }
};

export default withRouter(TutorialCard);
