import { OPEN_MODAL, CLOSE_MODAL } from '../constants/actionTypes';

const INITIAL_STATE = {
  modalShown: '',
};

export default (state = INITIAL_STATE, action) => {
  const { type, payload } = action;

  switch (type) {
    case OPEN_MODAL:
      return {
        ...state,
        modalShown: payload.modalType,
        modalData: payload.modalData,
      };

    case CLOSE_MODAL:
      return {
        ...state,
        modalShown: '',
      };

    default:
      return state;
  }

};