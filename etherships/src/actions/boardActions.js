import { SET_FIELD } from '../constants/actionTypes';


export const setField = payload => (dispatch) => {
    dispatch({ type: SET_FIELD, payload });
};