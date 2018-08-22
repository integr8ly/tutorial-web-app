import { getMessageFromResults, getStatusFromResults } from '../helpers';

const statusMiddleware = (config = {}) => {
  const statusSuffix = config.statusSuffix || 'STATUS';
  const rangeSuffix = config.rangeSuffix || 'STATUS_RANGE';
  const rangeFiller = config.rangeFiller || 'XX';
  const statusDelimiter = config.statusDelimiter || '_';
  const dispatchRange = config.statusRange || true;
  const dispatchStatus = config.dispatchStatus || false;

  // ToDo: Look at moving "getStatusFromResults" from helpers to statusMiddleware. Involves updating reducers
  // ToDo: Look at throwing an error earlier in the chain before Promise middleware
  return store => {
    const { dispatch } = store;

    return next => action => {
      if (action.payload) {
        const httpStatus = getStatusFromResults(action.payload);
        const message = getMessageFromResults(action.payload);

        if (httpStatus >= 0) {
          let range = 0;

          if (httpStatus > 99) {
            range = `${Math.floor(httpStatus / 100)}${rangeFiller}`;
          }

          if (dispatchRange) {
            dispatch({
              type: `${range}${statusDelimiter}${rangeSuffix}`,
              status: httpStatus,
              range,
              message
            });
          }

          if (dispatchStatus) {
            dispatch({
              type: `${httpStatus}${statusDelimiter}${statusSuffix}`,
              status: httpStatus,
              range,
              message
            });
          }
        }
      }

      return next(action);
    };
  };
};

export { statusMiddleware as default, statusMiddleware };
