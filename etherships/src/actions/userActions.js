import { SET_NAME, EDIT_NAME, EDIT_PRICE, REGISTERED } from '../constants/actionTypes';

import { createPeer } from '../services/webrtcService';
import { createUser, openChannel } from '../services/ethereumService';

import { browserHistory } from 'react-router';

import ethers from 'ethers';

export const setName = ({ target }) => (dispatch) => {

    dispatch({ type: SET_NAME, payload: createSession() });

    browserHistory.push('/game');
};

export const editName = ({ target }) => (dispatch) => {
    dispatch({ type: EDIT_NAME, payload: target.value });
};

export const editPrice = ({ target }) => (dispatch) => {
    console.log(target.value);

    dispatch({ type: EDIT_PRICE, payload: target.value });
};

export const register = ({ target }) => async (dispatch, getState) => {
    const state = getState();

    await createUser(state.user.userNameEdit, state.user.priceEdit);

    dispatch({ type: REGISTERED, payload: createSession() });

    browserHistory.push('/game');
};

function createSession() {
    const peer = createPeer();

    const wallet = ethers.Wallet.createRandom();

    return {
        peer,
        wallet
    };
}