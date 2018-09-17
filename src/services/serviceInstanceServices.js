/* eslint class-methods-use-this: ["error", { "exceptMethods": ["isTransformable", "transform"] }] */
class DefaultServiceInstanceTransform {
  isTransformable() {
    return true;
  }

  transform(siInfo) {
    return {
      kind: 'ServiceInstance',
      metadata: {
        generateName: `${siInfo.name}-`,
        namespace: siInfo.namespace
      },
      spec: {
        clusterServiceClassExternalName: siInfo.name,
        clusterServicePlanExternalName: `default-${siInfo.name}`
      }
    };
  }
}

class EnMasseServiceInstanceTransform {
  isTransformable(siInfo) {
    return siInfo.name === 'enmasse-standard';
  }

  transform(siInfo) {
    const defaultTransform = new DefaultServiceInstanceTransform().transform(siInfo);
    defaultTransform.spec.parameters = {
      name: siInfo.username
    };
    defaultTransform.spec.clusterServicePlanExternalName = 'unlimited-standard';
    return defaultTransform;
  }
}

const DEFAULT_TRANSFORMS = [new EnMasseServiceInstanceTransform(), new DefaultServiceInstanceTransform()];

const buildServiceInstanceResourceObj = (siInfo, transforms = DEFAULT_TRANSFORMS) => {
  const transform = transforms.find(t => t.isTransformable(siInfo));
  if (!transform) {
    return null;
  }
  return transform.transform(siInfo);
};

export { buildServiceInstanceResourceObj, DefaultServiceInstanceTransform, EnMasseServiceInstanceTransform };
