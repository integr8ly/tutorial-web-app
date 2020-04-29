import { findOpenshiftResource } from '../common/openshiftHelpers';
import { update } from '../services/openshiftServices';
import { rhmiConfigDef, rhmiConfigResource } from '../common/openshiftResourceDefinitions';

const configName = 'rhmi-config';
const configNamespace = 'redhat-rhmi-operator';

/**
 * Read the rhmi config and returns a promise containing
 * the config values. The name of the config resource is
 * always assumed to be `rhmi-config` and the namespace
 * is assumed to be `redhat-rhmi-operator`.
 *
 * getCurrentRhmiConfig().then(config => {
 *    // config represents the current rhmi config. The spec is defined
 *    // here: https://github.com/integr8ly/integreatly-operator/blob/master/deploy/crds/integreatly.org_rhmiconfigs_crd.yaml
 * }).catch(err => handleError);
 *
 * @returns {*}
 */
const getCurrentRhmiConfig = () => {
  const resource = rhmiConfigResource({
    name: configName,
    namespace: configNamespace
  });

  const compareFn = r => r.metadata.name === configName;
  return findOpenshiftResource(rhmiConfigDef(configNamespace), resource, compareFn);
};

/**
 * Update rhmi config by passing a modified config object
 *
 * updateRhmiConfig(config).then(newConfigValues => {
 *   // newConfigValues represents the updated config
 * }).catch(err => handleError);
 *
 * @param config
 * @returns {Promise<AxiosResponse<any>>}
 */
const updateRhmiConfig = config => update(rhmiConfigDef(configNamespace), config);

export { getCurrentRhmiConfig, updateRhmiConfig };
