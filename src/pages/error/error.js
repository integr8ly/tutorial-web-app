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
import { noop } from '../../common/helpers';
import RoutedConnectedMasthead from '../../components/masthead/masthead';
import { connect, reduxActions } from '../../redux';
import errorImage from '../../img/Icon_PF_Alert_LineArt_RGB_White.svg';

class ErrorPage extends React.Component {
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
          <PageSection variant={PageSectionVariants.darker} className="integr8ly-error-background">
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.full}>
                <img src={errorImage} alt="" className="integr8ly-error-image pf-u-mb-2xl" />
                <Title headingLevel="h2" id="main-content" size="lg">
                  Error 404
                </Title>
                <EmptyStateBody>Requested page not found:</EmptyStateBody>
                <EmptyStateBody> {window.location.href} </EmptyStateBody>
                <EmptyStateBody>Contact your administrator.</EmptyStateBody>
                <Button id="error-button" variant="primary" onClick={e => this.exitTutorial(e)}>
                  Go to home
                </Button>{' '}
              </EmptyState>
            </Bullseye>
          </PageSection>
        </Page>
      </React.Fragment>
    );
  }
}

ErrorPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

ErrorPage.defaultProps = {
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

const ConnectedErrorPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(ErrorPage);

const RouterErrorPage = withRouter(ErrorPage);

export { RouterErrorPage as default, ConnectedErrorPage, ErrorPage };
