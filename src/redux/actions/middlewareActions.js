import { middlewareTypes } from '../constants';
import { middlewareServices } from '../../services';

const listMiddleware = () => ({
  type: middlewareTypes.GET_MIDDLEWARE_SERVICES,
  payload: middlewareServices.getMiddlewareServices()
});

export { listMiddleware };
