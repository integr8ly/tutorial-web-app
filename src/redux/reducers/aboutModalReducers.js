import { aboutModalTypes } from '../constants';
import { setStateProp } from '../helpers';

const initialState = {
  show: false
};

const aboutModalReducers = (state = initialState, action) => {
  switch (action.type) {
    case aboutModalTypes.ABOUT_MODAL_SHOW:
      return setStateProp(
        null,
        {
          show: true,
          ...action
        },
        {
          state,
          initialState
        }
      );

    case aboutModalTypes.ABOUT_MODAL_HIDE:
      return setStateProp(
        null,
        {
          show: false
        },
        {
          state,
          initialState
        }
      );

    default:
      return state;
  }
};

aboutModalReducers.initialState = initialState;

export { aboutModalReducers as default, initialState, aboutModalReducers };
