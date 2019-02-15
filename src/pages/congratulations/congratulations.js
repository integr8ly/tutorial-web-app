import React from 'react';
import PropTypes from 'prop-types';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Page,
  PageSection,
  PageSectionVariants,
  Title
} from '@patternfly/react-core';
import { withRouter } from 'react-router-dom';
import { noop } from 'patternfly-react';
import { FlagCheckeredIcon } from '@patternfly/react-icons';
import RoutedConnectedMasthead from '../../components/masthead/masthead';
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
        <Page className="pf-u-h-100vh">
          <RoutedConnectedMasthead />
          <PageSection variant={PageSectionVariants.darker}>
            <Bullseye>
              <EmptyState>
                <EmptyStateIcon icon={FlagCheckeredIcon} />
                <Title size="lg">Congratulations, you completed the walkthrough!</Title>
                <EmptyStateBody>
                  Return to your homepage to explore more walkthroughs or go to your OpenShift console to utilize what
                  you just built!
                </EmptyStateBody>
                <Button variant="primary" onClick={e => this.exitTutorial(e)}>
                  Return to Home Page
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
