import statusMiddleware from './statusMiddleware';

const reduxMiddleware = {
  status: statusMiddleware
};

export { reduxMiddleware as default, reduxMiddleware, statusMiddleware };
