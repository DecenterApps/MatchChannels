import { CLOSE_MODAL, OPEN_MODAL } from '../constants/actionTypes';

export const openModal = (modalType, modalData) => (dispatch) => {
  dispatch({
    type: OPEN_MODAL,
    payload: {
      modalType,
      modalData,
    }
  });
};

export const closeModal = () => (dispatch) => { dispatch({ type: CLOSE_MODAL }); };
