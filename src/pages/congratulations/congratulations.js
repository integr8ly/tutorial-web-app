import React from 'react';
import PropTypes from 'prop-types';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Page,
  PageSection,
  PageSectionVariants,
  SkipToContent,
  Title
} from '@patternfly/react-core';
import { withRouter } from 'react-router-dom';
import { noop } from 'patternfly-react';
import RoutedConnectedMasthead from '../../components/masthead/masthead';
import { connect, reduxActions } from '../../redux';
import congratulationsImage from '../../img/Congratulations.svg';

class CongratulationsPage extends React.Component {
  exitTutorial = e => {
    e.preventDefault();
    const { history } = this.props;
    history.push(`/`);
  };

  render() {
    return (
      <React.Fragment>
        <Page className="pf-u-h-100vh">
          <SkipToContent href="#main-content">Skip to content</SkipToContent>
          <RoutedConnectedMasthead />
          <PageSection variant={PageSectionVariants.darker} className="integr8ly-congratulations-background">
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.full}>
                <img src={congratulationsImage} alt="" className="integr8ly-congratulations-image pf-u-mb-2xl" />
                <Title headingLevel="h1" size="lg" id="main-content">
                  Congratulations, you completed the Solution Pattern!
                </Title>
                <EmptyStateBody>
                  Return to your homepage to explore more Solution Patterns or go to your OpenShift console to utilize
                  what you just built!
                </EmptyStateBody>
                <Button id="congratulations-button" variant="primary" onClick={e => this.exitTutorial(e)}>
                  Return to home
                </Button>{' '}
              </EmptyState>
            </Bullseye>
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
