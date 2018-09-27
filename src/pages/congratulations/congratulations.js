import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { noop, Grid, Button } from 'patternfly-react';
import { connect, reduxActions } from '../../redux';
import Masthead from '../../components/masthead/masthead';

class CongratulationsPage extends React.Component {
  exitTutorial = e => {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/`);
  };

  render() {
    const { threadName } = this.props;
    return (
      <Grid fluid>
        <Grid.Row>
          <Masthead />
        </Grid.Row>
        <Grid.Row>
          <Grid.Col xs={12} sm={9} className="integr8ly-module mb-0">
            <div className="integr8ly-module-column">
              <div className="integr8ly-module-column--status">
                <span>Walkthrough</span>
              </div>
              <div className="integr8ly-module-column--steps integr8ly-congratulations">
                <span className="integr8ly-congratulations-logo" />
                <span className="integr8ly-congratulations-icon" />
                <h2 className="integr8ly-congratulations-heading">
                  Congratulations, you completed the
                  <br /> &quot;Integrating event-driven and API-driven applications
                  {threadName}
                  &quot; <br /> walkthrough!
                </h2>
                <p className="integr8ly-congratulations-paragraph">
                  Return to your homepage to explore more walkthroughs or go to your OpenShift console to utilize what
                  you just built!
                </p>
                <div className="integr8ly-congratulations-buttons">
                  <Button onClick={e => this.exitTutorial(e)}> Return to Home Page </Button>
                  <Button> Launch OpenShift Console </Button>
                </div>
              </div>
            </div>
          </Grid.Col>
          <Grid.Col sm={3} className="integr8ly-module mb-0">
            <h4 className="integr8ly-helpful-links-heading">Helpful Links</h4>
            <h4 className="integr8ly-helpful-links-product-title">Red Hat OpenShift</h4>
            <ul className="list-unstyled">
              <li>
                <a href="https://help.openshift.com/">OpenShift Online Help Center</a>
              </li>
              <li>
                <a href="https://blog.openshift.com/">OpenShift Blog</a>
              </li>
            </ul>
            <h4 className="integr8ly-helpful-links-product-title">
              Red Hat Fuse
              <span className="label label-default integr8ly-label-non-ga">Non-GA</span>
            </h4>
            <ul className="list-unstyled">
              <li>
                <a href="https://developers.redhat.com/products/fuse/help/">Fuse Community Q&amp;A</a>
              </li>
              <li>
                <a href="https://developers.redhat.com/videos/vimeo/95497167/">Fuse Overview</a>
              </li>
            </ul>
            <h4 className="integr8ly-helpful-links-product-title">Red Hat AMQ</h4>
            <ul className="list-unstyled">
              <li>
                <a href="https://developers.redhat.com/products/amq/help/">AMQ Community Q&amp;A</a>
              </li>
              <li>
                <a href="https://access.redhat.com/products/red-hat-amq">AMQ Videos</a>
              </li>
            </ul>
          </Grid.Col>
        </Grid.Row>
      </Grid>
    );
  }
}

CongratulationsPage.propTypes = {
  threadName: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

CongratulationsPage.defaultProps = {
  threadName: '',
  history: {
    push: noop
  }
};

const mapDispatchToProps = dispatch => ({
  getThread: (language, id) => dispatch(reduxActions.threadActions.getThread(language, id))
});

const mapStateToProps = state => ({
  ...state.threadReducers
});

const ConnectedCongratulationsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(CongratulationsPage);

const RouterCongratulationsPage = withRouter(CongratulationsPage);

export { RouterCongratulationsPage as default, ConnectedCongratulationsPage, CongratulationsPage };
