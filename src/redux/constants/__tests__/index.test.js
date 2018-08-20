import { reduxTypes, aboutModalTypes, userTypes } from '..';

describe('ReduxTypes', () => {
  it('should return types that are defined', () => {
    Object.keys(reduxTypes).forEach(type => expect(reduxTypes[type]).toBeDefined());
  });

  it('should return types that match', () => {
    expect(reduxTypes.aboutModal).toEqual(aboutModalTypes);
    expect(reduxTypes.user).toEqual(userTypes);
  });
});
