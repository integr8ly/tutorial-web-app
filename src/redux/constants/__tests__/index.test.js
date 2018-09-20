import { reduxTypes, aboutModalTypes, userTypes, threadTypes } from '..';

describe('ReduxTypes', () => {
  it('should return types that are defined', () => {
    Object.keys(reduxTypes).forEach(type => expect(reduxTypes[type]).toBeDefined());
  });

  it('should return types that match', () => {
    expect(reduxTypes.aboutModalTypes).toEqual(aboutModalTypes);
    expect(reduxTypes.userTypes).toEqual(userTypes);
    expect(reduxTypes.threadTypes).toEqual(threadTypes);
  });
});
