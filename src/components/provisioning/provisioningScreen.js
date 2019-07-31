import * as React from 'react';
import PropTypes from 'prop-types';
import {
  EmptyState,
  EmptyStateIcon,
  DataList,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListCell,
  Page,
  PageSection,
  PageSectionVariants,
  Progress,
  ProgressMeasureLocation,
  ProgressSize,
  Title,
  EmptyStateVariant
} from '@patternfly/react-core';
import { BoxesIcon, CheckCircleIcon, CircleNotchIcon } from '@patternfly/react-icons';
import {
  isServiceProvisioned,
  isServiceProvisioning,
  isServiceProvisionFailed
} from '../../common/walkthroughServiceHelpers';
import { getProductDetails } from '../../services/middlewareServices';
import { SERVICE_TYPES } from '../../redux/constants/middlewareConstants';

class ProvisioningScreen extends React.Component {
  componentDidMount() {}

  static isMiddlewareServiceProvisioned(svc) {
    if (svc.status && svc.status.conditions && svc.status.conditions[0]) {
      return svc.status.conditions[0].status === 'True';
    }
    return false;
  }

  static renderServiceLoadingIcon(svc) {
    if (isServiceProvisioned(svc)) {
      return (
        <div>
          <CheckCircleIcon className="integr8ly-provisioning-check" />
          <span className="integr8ly-provisioning-text pf-u-ml-sm"> Ready to use</span>
        </div>
      );
    }
    if (isServiceProvisioning(svc)) {
      return (
        <div className="integr8ly-provisioning-spinner">
          <CircleNotchIcon className="fa-spin" />{' '}
          <span className="integr8ly-provisioning-text pf-u-ml-sm"> Provisioning</span>
        </div>
      );
    }
    if (isServiceProvisionFailed(svc)) {
      return <div className="pficon pficon-error-circle-o" />;
    }
    return null;
  }

  static renderServiceLoadingBar(svc) {
    if (isServiceProvisioned(svc)) {
      return (
        <Progress
          className="pf-m-singleline integr8ly-provisioned-bar"
          value={100}
          measureLocation={ProgressMeasureLocation.outside}
          size={ProgressSize.lg}
        />
      );
    }
    if (isServiceProvisionFailed(svc)) {
      return (
        <div className="integr8ly-status-error">Unable to provision. Please contact your Red Hat representative.</div>
      );
    }
    if (isServiceProvisioning(svc)) {
      return (
        <Progress
          className="pf-m-singleline"
          value={60}
          measureLocation={ProgressMeasureLocation.outside}
          size={ProgressSize.lg}
        />
      );
    }
    return null;
  }

  static buildUniqueServiceKey(svc) {
    if (svc.type === SERVICE_TYPES.PROVISIONED_SERVICE) {
      return svc.name;
    }
    return svc.spec.clusterServiceClassExternalName;
  }

  static renderServiceStatusBar(svc) {
    const isProvisionFailed = isServiceProvisionFailed(svc);
    return (
      <DataListItem
        className={`${isProvisionFailed ? 'list-group-error-item' : null}`}
        key={ProvisioningScreen.buildUniqueServiceKey(svc)}
        aria-labelledby={`service-statusbar-datalistitem-${ProvisioningScreen.buildUniqueServiceKey(svc)}`}
      >
        <DataListItemRow>
          <DataListItemCells
            dataListCells={[
              <DataListCell key="primary content" className="pf-u-py-md">
                {ProvisioningScreen.renderServiceLoadingIcon(svc)}
              </DataListCell>,
              <DataListCell key="secondary content" className="pf-u-py-md">
                {getProductDetails(svc).prettyName}
              </DataListCell>,
              <DataListCell key="tertiary content" className="pf-u-py-md">
                {ProvisioningScreen.renderServiceLoadingBar(svc)}
              </DataListCell>
            ]}
          />
        </DataListItemRow>
      </DataListItem>
    );
  }

  static renderLoadingScreen(message, provisioningServices) {
    return (
      <Page className="pf-u-h-100vh">
        <PageSection
          variant={PageSectionVariants.darker}
          className="integr8ly-provisioning-background pf-u-display-flex pf-l-flex pf-u-justify-content-center"
        >
          <div />
          <EmptyState variant={EmptyStateVariant.full} className="pf-m-align-self-center">
            <EmptyStateIcon icon={BoxesIcon} />
            <Title headingLevel="h5" size="lg">
              {message}
            </Title>
          </EmptyState>
          <DataList className="pf-u-w-100" aria-label="Provisioned services datalist">
            {provisioningServices.map(ProvisioningScreen.renderServiceStatusBar)}
          </DataList>
        </PageSection>
      </Page>
    );
  }

  render() {
    const { provisioningServices, message } = this.props;
    return ProvisioningScreen.renderLoadingScreen(message, provisioningServices);
  }
}

ProvisioningScreen.propTypes = {
  provisioningServices: PropTypes.array,
  message: PropTypes.string
};

ProvisioningScreen.defaultProps = {
  provisioningServices: [],
  message: 'Provisioning services for your new environment.'
};

export { ProvisioningScreen as default, ProvisioningScreen };
