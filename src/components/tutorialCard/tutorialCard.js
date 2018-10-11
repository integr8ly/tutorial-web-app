import React from 'react';
import { Card, CardBody, CardFooter, CardTitle, ProgressBar, noop } from 'patternfly-react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

const TutorialCard = props => (
  <Card
    matchHeight
    className={props.progress === 100 ? 'integr8ly-tutorial-card integr8ly-card-complete' : 'integr8ly-tutorial-card'}
    onClick={e => {
      e.preventDefault();
      props.history.push(props.getStartedLink);
    }}
  >
    <CardTitle className="integr8ly-card-title">
      <div> {props.title} </div>
    </CardTitle>
    <CardBody> {props.children} </CardBody>
    <CardFooter className="integr8ly-tutorial-card-pf-footer">
      <a
        className={
          props.progress === 100
            ? 'integr8ly-tutorial-card-pf-footer-get-started integr8ly-text-complete'
            : 'integr8ly-tutorial-card-pf-footer-get-started'
        }
        href={props.getStartedLink}
      >
        {props.getStartedIcon}
        <span>{props.getStartedText}</span>
      </a>
      {props.progress === 0 ? (
        <div className="integr8ly-tutorial-card-pf-footer-time-to-complete">
          {props.minsIcon}
          {props.mins} <span>min</span>
        </div>
      ) : (
        <div className="progress-bar-table">
          <ProgressBar now={props.progress} />
          <span className="progress-label">{`${props.progress}%`} </span>
        </div>
      )}
    </CardFooter>
  </Card>
);

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
  /** Mins to complete the tutorial */
  mins: PropTypes.number.isRequired,
  /** Icon for the minutes label */
  minsIcon: PropTypes.object.isRequired,
  /** Progress in percent */
  progress: PropTypes.number.isRequired,
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
