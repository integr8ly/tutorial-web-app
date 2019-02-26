import React from 'react';
import { ProgressBar, noop } from 'patternfly-react';
import { Button, Card, CardHeader, CardBody, CardFooter } from '@patternfly/react-core';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

const TutorialCard = props => (
  <Card
    className={
      props.progress === 100
        ? 'integr8ly-c-card pf-u-h-100 integr8ly-c-card__status--complete'
        : 'integr8ly-c-card pf-u-h-100 integr8ly-c-card__status--in-progress'
    }
    onClick={e => {
      e.preventDefault();
      props.history.push(props.getStartedLink);
    }}
  >
    <CardHeader>
      <h4 className="pf-c-title pf-m-lg">{props.title}</h4>
    </CardHeader>
    <CardBody>{props.children}</CardBody>
    <CardFooter>
      <div className="integr8ly-c-card__info pf-u-w-100">
        <Button
          variant="link"
          type="button"
          aria-label="Navigate to Walkthrough"
          className={
            props.progress === 100
              ? 'pf-u-pl-0 integr8ly-c-card__status--complete-icon'
              : 'pf-u-pl-0 integr8ly-c-card__status--in-progress-icon'
          }
          href={props.getStartedLink}
        >
          {props.getStartedIcon}
          {props.getStartedText}
        </Button>
        {props.progress === 0 ? (
          <div className="integr8ly-c-card__time">
            {props.minsIcon}
            {props.mins} <span>min</span>
          </div>
        ) : (
          <div className="progress-bar-table">
            <ProgressBar now={props.progress} />
            <span className="progress-label pf-u-ml-sm">{`${props.progress}%`} </span>
          </div>
        )}
      </div>
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
