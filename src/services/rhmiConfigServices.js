import { findOpenshiftResource } from '../common/openshiftHelpers';
import { update } from '../services/openshiftServices';
import { rhmiConfigDef, rhmiConfigResource } from '../common/openshiftResourceDefinitions';
import { poll } from './openshiftServices';
import { FULFILLED_ACTION } from '../redux/helpers';
import { middlewareTypes } from '../redux/constants';

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

/**
 * 
 */
let rhmiCrPoolLister = null;
const watchRhmiConfig = (dispatch, rhmiConfig, watch) => {

  if (rhmiCrPoolLister){
    rhmiCrPoolLister.clear()
  }

  if (!watch) {
    console.log(
      "Stopped watching rhmiconfig customer resource"
    )
    return;
  }
    
  poll(rhmiConfigDef(configNamespace))
    .then(pollListener => {
      rhmiCrPoolLister = pollListener;
      console.log(
        "Started watching rhmiconfig customer resource"
      )
      pollListener.onEvent(data => {
        if (JSON.stringify(data) === JSON.stringify(rhmiConfig)) {
          return;
        }

        rhmiConfig = data
        dispatch({
          type: FULFILLED_ACTION(middlewareTypes.GET_RHMICONFIG_CR),
          payload: data
        })
      })
    })
}

export { getCurrentRhmiConfig, updateRhmiConfig, watchRhmiConfig};
