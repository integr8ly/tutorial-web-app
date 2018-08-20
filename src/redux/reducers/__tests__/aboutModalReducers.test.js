import { aboutModalReducers } from '..';
import { aboutModalTypes as types } from '../../constants';

describe('ConfirmationModalReducers', () => {
  it('should return the initial state', () => {
    expect(aboutModalReducers.initialState).toBeDefined();
  });

  it('should handle all defined types', () => {
    Object.keys(types).forEach(value => {
      const dispatched = {
        type: value
      };

      const resultState = aboutModalReducers(undefined, dispatched);

      expect({ type: value, result: resultState }).toMatchSnapshot('defined types');
    });
  });
});
