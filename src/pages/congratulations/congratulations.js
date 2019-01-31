import React from 'react';
import PropTypes from 'prop-types';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateAction,
  Page,
  PageSection,
  TextContent,
  Title
} from '@patternfly/react-core';
import { withRouter } from 'react-router-dom';
import { noop, Button } from 'patternfly-react';
import { Masthead } from '../../components/masthead/masthead';
import { connect, reduxActions } from '../../redux';

class CongratulationsPage extends React.Component {
  exitTutorial = e => {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/`);
  };

  render() {
    return (
      <React.Fragment>
        <Page>
          <Masthead />
          <PageSection className="pf-m-dark-100 integr8ly-congratulations">
            <TextContent>
              <Bullseye>
                <EmptyState>
                  <img src="/assets/images/congratulations.svg" alt="congratulations" width="200px" height="200px" />
                  <Title size="4xl">Congratulations, you completed the walkthrough!</Title>
                  <EmptyStateBody>
                    Return to your homepage to explore more walkthroughs or go to your OpenShift console to utilize what
                    you just built!
                  </EmptyStateBody>
                  <EmptyStateAction>
                    <Button bsStyle="default" onClick={e => this.exitTutorial(e)}>
                      Return to Home Page
                    </Button>{' '}
                  </EmptyStateAction>
                </EmptyState>
              </Bullseye>
            </TextContent>
          </PageSection>
        </Page>
      </React.Fragment>
    );
  }
}

CongratulationsPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

CongratulationsPage.defaultProps = {
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
