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
import { noop } from 'patternfly-react';
import RoutedConnectedMasthead from '../../components/masthead/masthead';
import { connect, reduxActions } from '../../redux';
import Breadcrumb from '../../components/breadcrumb/breadcrumb';
// import { setUserWalkthroughs, getUserWalkthroughs } from '../../services/walkthroughServices';

class DevResourcesPage extends React.Component {
  // constructor(props) {
  //   super(props);

  //   const { clusterId, clusterType } = this.props;

  //   const { userWalkthroughs } = this.props;

  // this.state = {
  //   value: userWalkthroughs || '',
  //   isValid: true
  // };

  // if mockdata, use localhost as the cluster type, otherwise get the type via window.OPENSHIFT_CONFIG
  // which is itself derived from an env var in server.js
  getClusterType = () => {
    let clusterType = '';

    if (window.OPENSHIFT_CONFIG) {
      if (window.OPENSHIFT_CONFIG.mockData) {
        clusterType = 'localhost';
        console.log(`Running locally, the clusterType is: ${clusterType}`);
      } else {
        clusterType = window.OPENSHIFT_CONFIG.clusterType;
        console.log(`Running on server, the clusterType is: ${clusterType}`);
      }
    }
    return clusterType;
  };

  // method that retrieves the clusterId from a URL
  getClusterId = url => {
    let urlParts = [];
    let clusterId = '';
    const clusterType = this.getClusterType();
    urlParts = new URL(url).host.split('.');
    const [pocClusterId, , rhpdsClusterId] = urlParts;

    switch (clusterType) {
      case 'rhpds':
        clusterId = rhpdsClusterId;
        break;
      case 'poc':
        clusterId = pocClusterId;
        break;
      case 'osd':
        clusterId = rhpdsClusterId;
        break;
      case 'dev':
        clusterId = rhpdsClusterId;
        break;
      default:
        clusterId = 'my-cluster-id';
    }

    // uriString = uriString.replace('https://master.', '');
    // uriString = uriString.substring(0, uriString.indexOf('.'));

    console.log(`Original Url: ${url}`);
    console.log(`Cluster type: ${clusterType}`);
    console.log(`Cluster ID: ${clusterId}`);

    return clusterId;
  };

  render() {
    // this.parseClusterId();
    // const {} = this.state;
    const loggingTooltip = 'The URL for the aggregate logging Kibana interface.';
    const apiTooltip = 'The URL for the OpenShift and Kubernetes REST API.';
    const registryTooltip = 'The URL for the private image registry.';

    // const rhpdsUri = 'https://tutorial-web-app-webapp.apps.uxddev-b2b9.openshiftworkshop.com/';
    const rhmiUri = 'https://puma.rhmi.io/';
    // const clusterType = 'rhpds';

    // const clusterId = 'uxddev-17f0'; // MF080519 - get this from the existing variable
    const clusterId = this.getClusterId(rhmiUri); // MF080519 - get this from the existing variable

    // MF080519 - need to get this from env var and populate with the correct one
    const osdLoggingUrl = `https://logs.${clusterId}.openshift.com`;
    // const pocLoggingUrl = `https://kibana.apps.${clusterId}.rhmi.io`;
    // const pdsLoggingUrl = `https://kibana.apps.${clusterId}.openshiftworkshop.com`;

    const osdApiUrl = `https://api.${clusterId}.openshift.com`;
    // const pocApiUrl = `https://master.${clusterId}.rhmi.io/api`;
    // const pdsApiUrl = `https://master.${clusterId}.openshiftworkshop.com/api`;

    const osdRegistryUrl = `https://registry.${clusterId}.openshift.com`;
    // const pocRegistryUrl = `https://registry-console-default.apps.${clusterId}.rhmi.io`;
    // const pdsRegistryUrl = `https://registry-console-default.apps.${clusterId}.openshiftworkshop.com`;

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
                  <Button variant="link" icon={<ExternalLinkSquareAltIcon />}>
                    {osdLoggingUrl}
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
                    {osdApiUrl}
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
                    {osdRegistryUrl}
                  </ClipboardCopy>
                </CardBody>
                <CardFooter />
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
