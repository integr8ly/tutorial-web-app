import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  ClipboardCopy,
  Page,
  PageSection,
  PageSectionVariants,
  SkipToContent,
  Tooltip
} from '@patternfly/react-core';
import { ExternalLinkSquareAltIcon, HelpIcon } from '@patternfly/react-icons';
import { withRouter } from 'react-router-dom';
import { noop } from '../../common/helpers';
import RoutedConnectedMasthead from '../../components/masthead/masthead';
import { connect, reduxActions } from '../../redux';
import Breadcrumb from '../../components/breadcrumb/breadcrumb';

class DevResourcesPage extends React.Component {
  getClusterUrls = () => {
    const uri = window.location.href;

    let clusterType = '';
    let urlParts = [];
    const urls = { loggingUrl: '', apiUrl: '', registryUrl: '' };

    urlParts = new URL(uri).host.split('.');
    const [, , clusterId] = urlParts;

    if (window.OPENSHIFT_CONFIG) {
      clusterType = window.OPENSHIFT_CONFIG.mockData ? 'localhost' : window.OPENSHIFT_CONFIG.clusterType;
    }
    switch (clusterType) {
      case 'rhpds':
        urls.loggingUrl = `https://kibana.apps.${clusterId}.open.redhat.com`;
        urls.apiUrl = `https://master.apps.${clusterId}.open.redhat.com`;
        urls.registryUrl = `https://registry-console-default.apps.${clusterId}.open.redhat.com`;
        break;
      case 'poc':
        urls.loggingUrl = `https://kibana.apps.${clusterId}.rhmi.io`;
        urls.apiUrl = `https://master.apps.${clusterId}.rhmi.io/api`;
        urls.registryUrl = `https://registry-console-default.apps.${clusterId}.rhmi.io`;
        break;
      case 'osd':
        urls.loggingUrl = `https://logs.${clusterId}.openshift.com`;
        urls.apiUrl = `https://api.${clusterId}.openshift.com`;
        urls.registryUrl = `https://registry.${clusterId}.openshift.com`;
        break;
      case 'localhost':
        urls.loggingUrl = `No logging URL when running locally`;
        urls.apiUrl = `No API URL when running locally`;
        urls.registryUrl = `No registry URL when running locally`;
        break;
      default:
        urls.loggingUrl = `Unknown logging URL`;
        urls.apiUrl = `Unknown API URL`;
        urls.registryUrl = `Unknown registry URL`;
    }
    return urls;
  };

  render() {
    const loggingTooltip = 'The URL for the aggregate logging Kibana interface.';
    const apiTooltip = 'The URL for the OpenShift and Kubernetes REST API.';
    const registryTooltip = 'The URL for the private image registry.';

    const { loggingUrl, apiUrl, registryUrl } = this.getClusterUrls();

    return (
      <Page className="pf-u-h-100vh">
        <SkipToContent href="#main-content">Skip to content</SkipToContent>
        <RoutedConnectedMasthead />
        <PageSection variant={PageSectionVariants.default}>
          <Breadcrumb homeClickedCallback={() => {}} threadName="Developer resources" />
          <Grid gutter="md">
            <GridItem mdOffset={4} md={12}>
              <h1 id="main-content" className="pf-c-title pf-m-2xl pf-u-mt-sm">
                Developer resources
              </h1>
              <Card className="pf-u-w-50 pf-u-my-xl">
                <div className="integr8ly-dev-resources-content">
                  <CardHeader>
                    <h2 className="pf-m-lg integr8ly-dev-resources-title">Cluster URLs</h2>
                  </CardHeader>
                  <CardBody>
                    <h4 className="pf-m-lg integr8ly-dev-resources-resource-title">
                      Logging
                      <Tooltip position="top" content={<div>{loggingTooltip}</div>}>
                        <span>
                          <HelpIcon className="pf-u-ml-sm integr8ly-dev-resources-icon" />
                        </span>
                      </Tooltip>
                    </h4>
                    <Button
                      variant="link"
                      target="_blank"
                      icon={<ExternalLinkSquareAltIcon />}
                      component="a"
                      href={loggingUrl === `No logging URL when running locally` ? ' ' : loggingUrl}
                    >
                      {loggingUrl}
                    </Button>{' '}
                  </CardBody>
                  <CardBody>
                    <h4 className="pf-m-lg integr8ly-dev-resources-resource-title">
                      API
                      <Tooltip position="top" content={<div>{apiTooltip}</div>}>
                        <span>
                          <HelpIcon className="pf-u-ml-sm integr8ly-dev-resources-icon" />
                        </span>
                      </Tooltip>
                    </h4>
                    <ClipboardCopy id="api-cc" isReadOnly>
                      {apiUrl}
                    </ClipboardCopy>
                  </CardBody>
                  <CardBody>
                    <h4 className="pf-m-lg integr8ly-dev-resources-resource-title">
                      Registry
                      <Tooltip position="top" content={<div>{registryTooltip}</div>}>
                        <span>
                          <HelpIcon className="pf-u-ml-sm integr8ly-dev-resources-icon" />
                        </span>
                      </Tooltip>
                    </h4>
                    <ClipboardCopy id="registry-cc" isReadOnly>
                      {registryUrl}
                    </ClipboardCopy>
                  </CardBody>
                  <CardFooter />
                </div>
              </Card>
            </GridItem>
          </Grid>
        </PageSection>
      </Page>
    );
  }
}

DevResourcesPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

DevResourcesPage.defaultProps = {
  history: {
    push: noop
  }
};

const mapDispatchToProps = dispatch => ({
  getThread: (language, id) => dispatch(reduxActions.threadActions.getThread(language, id))
});

const mapStateToProps = state => ({
  ...state.walkthroughServiceReducers
});

const ConnectedDevResourcesPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(DevResourcesPage);

const RouterDevResourcesPage = withRouter(DevResourcesPage);

export { RouterDevResourcesPage as default, ConnectedDevResourcesPage, DevResourcesPage };
