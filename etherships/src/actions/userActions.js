import { SET_NAME, EDIT_NAME } from '../constants/actionTypes';

import { createPeer } from '../services/webrtcService';

import { browserHistory } from 'react-router'

export const setName = ({ target }) => (dispatch) => {
    const peer = createPeer();

    dispatch({ type: SET_NAME, payload: peer });

    browserHistory.push('/game');
};

export const editName = ({ target }) => (dispatch) => {
    dispatch({ type: EDIT_NAME, payload: target.value });
};