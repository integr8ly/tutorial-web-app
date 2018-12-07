import { buildValidProjectNamespaceName } from '../openshiftHelpers';

describe('OpenShift Helpers', () => {
  it('should correctly trim the namespace name when it is too long', () => {
    const namespace = buildValidProjectNamespaceName('verylongusername', 'verylongsuffix');
    expect(namespace).toHaveLength(20);
    expect(namespace).toBe('verylongus-very-c423');
  });

  it('should have a longer suffix if the username is short', () => {
    const namespace = buildValidProjectNamespaceName('u', 'myverylongsuffix');
    expect(namespace).toHaveLength(20);
    expect(namespace).toBe('u-myverylongsuf-e2f4');
  });

  it('should not trim the namespace when username and suffix are too short', () => {
    const namespace = buildValidProjectNamespaceName('u', 's');
    expect(namespace).toHaveLength(8);
    expect(namespace).toBe('u-s-b507');
  });
});
