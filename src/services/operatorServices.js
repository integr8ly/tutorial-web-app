import {
  packageManifestDef,
  catalogSourceConfigDef,
  subscriptionDef,
  operatorGroupDef,
  csvDef
} from '../common/openshiftResourceDefinitions';
import { get, poll } from './openshiftServices';
import { findOrCreateOpenshiftResource } from '../common/openshiftHelpers';

const NS_OPENSHIFT_MARKETPLACE = 'openshift-marketplace';
const DEFAULT_MANIFEST_PROVIDER_LABEL = 'opsrc-provider';
const DEFAULT_MANIFEST_PROVIDER_VALUE = 'custom';
const DEFAULT_INSTALL_PLAN_APPROVAL = 'Automatic';

const getDefaultManifestGetOpts = () => ({
  resourceGetFn: get
});

const getDefaultCSCCreateOpts = () => ({
  cscNamespace: NS_OPENSHIFT_MARKETPLACE,
  resourceCreateFn: findOrCreateOpenshiftResource
});

const getDefaultOGCreateOpts = () => ({
  resourceCreateFn: findOrCreateOpenshiftResource
});

const getDefaultCreateSubscriptionOpts = () => ({
  resourceCreateFn: findOrCreateOpenshiftResource
});

const getPackageManifest = (name, namespace = NS_OPENSHIFT_MARKETPLACE, options = getDefaultManifestGetOpts()) => {
  if (!name) {
    return Promise.reject(new Error('manifest name must be specified'));
  }
  if (!namespace) {
    return Promise.reject(new Error('manifest namespace must be specified'));
  }

  const mergedOpts = Object.assign({}, getDefaultManifestGetOpts(), options);
  return mergedOpts.resourceGetFn(packageManifestDef(namespace), name);
};

const createCatalogSourceFromManifest = (manifest, targetNamespace, options = getDefaultCSCCreateOpts()) => {
  if (!manifest) {
    return Promise.reject(new Error('manifest must be specified'));
  }
  if (!targetNamespace) {
    return Promise.reject(new Error('target namespace must be specified'));
  }
  if (
    !manifest.status ||
    !manifest.status.catalogSourceDisplayName ||
    !manifest.status.catalogSourcePublisher ||
    !manifest.status.packageName
  ) {
    return Promise.reject(new Error('manifest must have the required status attributes'));
  }

  const mergedOpts = Object.assign({}, getDefaultCSCCreateOpts(), options);
  const providerLabel =
    manifest.labels && manifest.labels[DEFAULT_MANIFEST_PROVIDER_LABEL]
      ? manifest.labels[DEFAULT_MANIFEST_PROVIDER_LABEL]
      : DEFAULT_MANIFEST_PROVIDER_VALUE;
  const cscRes = {
    kind: 'CatalogSourceConfig',
    metadata: {
      name: `installed-${providerLabel}-${targetNamespace}-${manifest.metadata.name}`,
      namespace: mergedOpts.cscNamespace
    },
    spec: {
      csDisplayName: manifest.status.catalogSourceDisplayName,
      csPublisher: manifest.status.catalogSourcePublisher,
      packages: manifest.status.packageName,
      targetNamespace
    }
  };
  return mergedOpts.resourceCreateFn(catalogSourceConfigDef(mergedOpts.cscNamespace), cscRes);
};

const createOperatorGroupFromCSC = (catalogSrc, options = getDefaultOGCreateOpts()) => {
  if (!catalogSrc) {
    return Promise.reject(new Error('catalog source must be specified'));
  }
  if (!catalogSrc.spec || !catalogSrc.spec.targetNamespace) {
    return Promise.reject(new Error('target namespace must be defined in the catalog source spec'));
  }

  const mergedOpts = Object.assign({}, getDefaultOGCreateOpts(), options);
  const ogRes = {
    kind: 'OperatorGroup',
    metadata: {
      name: catalogSrc.spec.targetNamespace,
      namespace: catalogSrc.spec.targetNamespace
    },
    spec: {
      targetNamespaces: [catalogSrc.spec.targetNamespace]
    }
  };
  return mergedOpts.resourceCreateFn(operatorGroupDef(catalogSrc.spec.targetNamespace), ogRes);
};

const createSubscriptionFromCSC = (catalogSrc, manifest, options = getDefaultCreateSubscriptionOpts()) => {
  if (!catalogSrc) {
    return Promise.reject(new Error('catalog source must be defined'));
  }
  if (!manifest) {
    return Promise.reject(new Error('manifest must be defined'));
  }

  const mergedOpts = Object.assign({}, getDefaultCreateSubscriptionOpts(), options);
  const channel = options.channel || manifest.status.defaultChannel;
  const csv = manifest.status.channels.find(c => c.name === channel);
  if (!csv) {
    return Promise.reject(new Error(`channel ${channel} not found in manifest ${manifest.metadata.name}`));
  }
  const subRes = {
    kind: 'Subscription',
    metadata: {
      name: catalogSrc.spec.packages,
      namespace: catalogSrc.spec.targetNamespace
    },
    spec: {
      channel,
      installPlanApproval: DEFAULT_INSTALL_PLAN_APPROVAL,
      name: manifest.status.packageName,
      source: catalogSrc.metadata.name,
      sourceNamespace: catalogSrc.spec.targetNamespace,
      startingCSV: csv.currentCSV
    }
  };
  return mergedOpts.resourceCreateFn(subscriptionDef(catalogSrc.spec.targetNamespace), subRes);
};

const handleCSVWatchResult = (csvTOWatch, onComplete, csv) => {
  if (csv.metadata.name !== csvTOWatch) {
    return;
  }
  if (!csv.status || !csv.status.phase === 'Succeeded') {
    return;
  }
  onComplete({ csv });
};

const provisionOperator = async (manifestName, namespace) => {
  if (!manifestName) {
    return Promise.reject(new Error('manifest name must be defined'));
  }
  console.log(`provisioning operator from manifest ${manifestName}`);
  return new Promise((resolve, reject) => {
    getPackageManifest(manifestName)
      .then(pm => {
        console.log(`creating catalog source config from manifest ${manifestName}`, pm);
        return createCatalogSourceFromManifest(pm, namespace).then(csc => [pm, csc]);
      })
      .then(([pm, csc]) => {
        console.log(`creating operator group from catalog source config ${csc.metadata.name}`, csc);
        return createOperatorGroupFromCSC(csc, pm).then(og => [pm, csc, og]);
      })
      .then(([pm, csc, og]) => {
        console.log(`creating subscription from catalog source config ${csc.metadata.name}`, csc);
        return createSubscriptionFromCSC(csc, pm).then(sub => [pm, csc, og, sub]);
      })
      .then(resources => {
        console.log(`watching for syndesis resources in namespace ${namespace}`);
        const sub = resources[resources.length - 1];
        poll(csvDef(namespace)).then(listener =>
          listener.onEvent(
            handleCSVWatchResult.bind(null, sub.spec.startingCSV, csv => {
              listener.clear();
              resolve(csv);
            })
          )
        );
      });
  });
};

export {
  getPackageManifest,
  createCatalogSourceFromManifest,
  createOperatorGroupFromCSC,
  createSubscriptionFromCSC,
  provisionOperator
};
