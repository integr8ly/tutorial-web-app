import get from 'lodash.get';

export const getStatusFromResults = results => {
  let status = get(results, 'response.status', results.status);

  if (status === undefined) {
    status = 0;
  }
  return status;
};

export const getMessageFromResults = (results, filterField = null) => {
  const status = get(results, 'response.status', results.status);
  const statusResponse = get(results, 'response.statusText', results.statusText);
  const messageResponse = get(results, 'response.data', results.message);
  const detailResponse = get(results, 'response.data', results.detail);

  if (status < 400 && !messageResponse && !detailResponse) {
    return statusResponse;
  }

  if (status >= 500 || (status === undefined && (messageResponse || detailResponse))) {
    return `${status || ''} Server is currently unable to handle this request. ${messageResponse ||
      detailResponse ||
      ''}`;
  }

  if (typeof messageResponse === 'string') {
    return messageResponse;
  }

  if (typeof detailResponse === 'string') {
    return detailResponse;
  }

  const getMessages = (messageObject, filterKey) => {
    const obj = filterKey ? messageObject[filterKey] : messageObject;
    if (obj) {
      if (typeof obj === 'object') {
        return Object.values(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(next => {
          if (Array.isArray(next)) {
            return getMessages(next);
          }
          return next;
        });
      }
    }
    return [];
  };
  return getMessages(messageResponse || detailResponse, filterField).join('\n');
};

export const FULFILLED_ACTION = (base = '') => `${base}_FULFILLED`;

export const PENDING_ACTION = (base = '') => `${base}_PENDING`;

export const REJECTED_ACTION = (base = '') => `${base}_REJECTED`;

export const HTTP_STATUS_RANGE = status => `${status}_STATUS_RANGE`;

export const setStateProp = (prop, data, options) => {
  const { state = {}, initialState = {}, reset = true } = options;
  let obj = { ...state };

  if (prop && !state[prop]) {
    console.error(`Error: Property ${prop} does not exist within the passed state.`, state);
  }

  if (reset && prop && !initialState[prop]) {
    console.warn(`Warning: Property ${prop} does not exist within the passed initialState.`, initialState);
  }

  if (reset && prop) {
    obj[prop] = {
      ...state[prop],
      ...initialState[prop],
      ...data
    };
  } else if (reset && !prop) {
    obj = {
      ...state,
      ...initialState,
      ...data
    };
  } else if (prop) {
    obj[prop] = {
      ...state[prop],
      ...data
    };
  } else {
    obj = {
      ...state,
      ...data
    };
  }

  return obj;
};
