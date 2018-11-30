import React from 'react';
import { ProgressBar, noop } from 'patternfly-react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

const TutorialCard = props => (
  <div
    className={
      props.progress === 100 ? 'pf-c-card  integr8ly-c-card integr8ly-card-complete' : 'pf-c-card integr8ly-c-card'
    }
    onClick={e => {
      e.preventDefault();
      props.history.push(props.getStartedLink);
    }}
  >
    <div className="pf-c-card__header">
      <h4 className="pf-c-title pf-m-xl">{props.title}</h4>
    </div>
    <div className="pf-c-card__body"> {props.children} </div>
    <div className="pf-c-card__footer">
      <div className="integr8ly-c-card__info">
        <a
          className={props.progress === 100 ? 'pf-c-button pf-m-link integr8ly-text-complete' : 'pf-c-button pf-m-link'}
          href={props.getStartedLink}
        >
          {props.getStartedIcon}
          <span>{props.getStartedText}</span>
        </a>
      </div>
      <div className="integr8ly-c-card__time--progress">
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
      </div>
    </div>
  </div>
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
