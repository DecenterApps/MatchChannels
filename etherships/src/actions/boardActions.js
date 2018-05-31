import { SET_FIELD, CREATE_TREE } from '../constants/actionTypes';

import { generateTree } from '../services/boardService';

export const setField = payload => (dispatch) => {
    dispatch({ type: SET_FIELD, payload });
};

export const generateBoard = board => (dispatch, getState) => {

    const web3 = getState().web3;

    const payload = generateTree(board);

    dispatch({ type: CREATE_TREE, payload });
};