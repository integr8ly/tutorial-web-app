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
  constructor(props) {
    super(props);

    this.state = {
      clusterId: '',
      loggingUrl: '',
      clusterType: ''
    };
  }

  componentDidMount() {
    this.getClusterType();
  }

  componentDidUpdate(prevState) {
    const uri = window.location.href;
    if (this.state.clusterType !== prevState.clusterType) {
      this.getClusterId(uri);
    }
  }

  // if mockdata, use localhost as the cluster type, otherwise get the type via window.OPENSHIFT_CONFIG
  // which is itself derived from an env var in server.js
  getClusterType = () => {
    let cType = '';

    if (window.OPENSHIFT_CONFIG) {
      if (window.OPENSHIFT_CONFIG.mockData) {
        cType = 'localhost';
        console.log(`Running locally, the clusterType is: ${cType}`);
      } else {
        cType = window.OPENSHIFT_CONFIG.clusterType;
        console.log(`Running on server, the clusterType is: ${cType}`);
      }
    }
    // this.setState({ clusterType: cType }, () => console.log(this.state.clusterType));

    this.setState({ clusterType: cType }, () => console.log(this.state.clusterType));

    // return clusterType;
  };

  // method that retrieves the clusterId from a URL
  getClusterId = url => {
    let urlParts = [];
    // let clusterId = '';
    // let loggingUrl = '';
    // const clusterType = this.getClusterType();
    urlParts = new URL(url).host.split('.');
    const [pocClusterId, , rhpdsClusterId] = urlParts;

    switch (this.state.clusterType) {
      case 'rhpds':
        // 'https://tutorial-web-app-webapp.apps.puma.openshiftworkshop.com/'
        // 'https://tutorial-web-app-webapp.apps.puma.open.redhat.com/'

        this.setState = ({
          clusterId: rhpdsClusterId,
          loggingUrl: `https://kibana.apps.${rhpdsClusterId}.openshiftworkshop.com`
        },
        () => {
          console.log('loggingUrl =', this.state.loggingUrl);
        });
        console.log(this.state);
        break;
      // clusterId = rhpdsClusterId;
      //     loggingUrl = `https://kibana.apps.${clusterId}.openshiftworkshop.com`;
      //     break;
      case 'poc':
        this.setState = ({
          clusterId: pocClusterId,
          loggingUrl: `https://kibana.apps.${pocClusterId}.openshiftworkshop.com`
        },
        () => {
          console.log('loggingUrl =', this.state.loggingUrl);
        });
        console.log(this.state);
        break;
      // 'https://puma.rhmi.io/'
      // clusterId = pocClusterId;
      // break;
      case 'osd':
        this.setState = ({
          clusterId: pocClusterId,
          loggingUrl: `https://kibana.apps.${pocClusterId}.openshiftworkshop.com`
        },
        () => {
          console.log('loggingUrl =', this.state.loggingUrl);
        });
        console.log(this.state);
        break;
      // `https://puma.openshift.com`
      // clusterId = pocClusterId;
      // break;
      default:
        this.setState = ({
          clusterId: pocClusterId,
          loggingUrl: `https://kibana.apps.${pocClusterId}.openshiftworkshop.com`
        },
        () => {
          console.log('loggingUrl =', this.state.loggingUrl);
        });
        console.log(this.state);
      //   clusterId = 'localhost';
      // loggingUrl = `https://kibana.apps.${clusterId}.openshiftworkshop.com`;
    }

    // question: is clusterId just the hostname? if so, can try using window.location.hostname
    // see this: https://guide.freecodecamp.org/javascript/window-location/

    // uriString = uriString.replace('https://master.', '');
    // uriString = uriString.substring(0, uriString.indexOf('.'));

    console.log(`Original Url: ${url}`);
    console.log(`Cluster type: ${this.state.clusterType}`);
    console.log(`Cluster ID: ${this.state.clusterId}`);
    console.log(`Results of window.location.hostname: ${window.location.hostname}`);
    console.log(`Results of window.location.host: ${window.location.host}`);

    // return clusterId;
  };

  render() {
    // this.parseClusterId();
    // const {} = this.state;
    const loggingTooltip = 'The URL for the aggregate logging Kibana interface.';
    const apiTooltip = 'The URL for the OpenShift and Kubernetes REST API.';
    const registryTooltip = 'The URL for the private image registry.';

    const loggingUrl = this.state.loggingUrl;

    // const rhpdsUri = 'https://tutorial-web-app-webapp.apps.uxddev-b2b9.openshiftworkshop.com/';
    // const rhmiUri = 'https://puma.rhmi.io/';
    // const clusterType = 'rhpds';
    const uri = window.location.href;

    // const clusterId = 'uxddev-17f0'; // MF080519 - get this from the existing variable
    // const clusterId = this.getClusterId(uri); // MF080519 - get this from the existing variable
    const clusterId = this.state.clusterId;

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
                    {/* {osdLoggingUrl} */}
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
