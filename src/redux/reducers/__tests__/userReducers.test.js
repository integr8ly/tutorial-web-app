import { userReducers } from '..';
import { userTypes as types } from '../../constants';
import { REJECTED_ACTION, PENDING_ACTION, FULFILLED_ACTION } from '../../helpers';

describe('UserReducers', () => {
  it('should return the initial state', () => {
    expect(userReducers.initialState).toBeDefined();
  });

  it('should handle all defined error types', () => {
    Object.keys(types).forEach(value => {
      const dispatched = {
        type: REJECTED_ACTION(value),
        error: true,
        payload: {
          message: 'MESSAGE',
          response: {
            data: {
              detail: 'ERROR'
            }
          }
        }
      };

      const resultState = userReducers(undefined, dispatched);

      expect({ type: REJECTED_ACTION(value), result: resultState }).toMatchSnapshot('rejected types');
    });
  });

  it('should handle all defined pending types', () => {
    Object.keys(types).forEach(value => {
      const dispatched = {
        type: PENDING_ACTION(value)
      };

      const resultState = userReducers(undefined, dispatched);

      expect({ type: PENDING_ACTION(value), result: resultState }).toMatchSnapshot('pending types');
    });
  });

  it('should handle all defined fulfilled types', () => {
    Object.keys(types).forEach(value => {
      const dispatched = {
        type: FULFILLED_ACTION(value),
        payload: {
          data: {
            test: 'success'
          }
        }
      };

      const resultState = userReducers(undefined, dispatched);

      expect({ type: FULFILLED_ACTION(value), result: resultState }).toMatchSnapshot('fulfilled types');
    });
  });
});
