import { 
    SET_NAME, 
    EDIT_NAME, 
    EDIT_PRICE, 
    REGISTERED, 
    NEW_GAME, 
    CREATE_PEER,
    SET_CONNECTION,
    PICK_FIELDS,
    LOAD_USER,
    RESET_CHANNEL,
    SET_OPPONENT_ADDR,
    } from '../constants/actionTypes';

import { createPeer } from '../services/webrtcService';
import { createUser } from '../services/ethereumService';

import { browserHistory } from 'react-router';
import short from 'short-uuid';

import ethers from 'ethers';

export const newGame = (price) => (dispatch) => {
    dispatch({ type: NEW_GAME, payload: {price, session: createSession() } });

    localStorage.removeItem('user');
    localStorage.removeItem('board');

    browserHistory.push('/game');
};

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

    browserHistory.push('/users');
};

export const initAccount = () => (dispatch) =>  {

    let peerId = localStorage.getItem('peer');

    if(!peerId) {
      peerId = short.uuid();
    
      localStorage.setItem('peer', peerId);
    }

    const peer = createPeer(peerId);

    let user = localStorage.getItem("user");


    const userWallet = ethers.Wallet.createRandom();
    
    if (user) {
        user = JSON.parse(user);

        if (!user.userWallet) {
            user.userWallet = userWallet;
        }
    } else {
        user = { userWallet };
    }

    console.log(user);

    dispatch({ type: LOAD_USER, payload: user});

    dispatch({ type: CREATE_PEER, payload: {peer, peerId} });
};

export const setConnection = (connection, channelId) => (dispatch) => {

    console.log('channel  ', channelId);

    const wallet = ethers.Wallet.createRandom();

    dispatch({ type: SET_CONNECTION, payload: {connection, wallet, channelId} });
};

export const pickFields = (channelId, amount, addr) => (dispatch) => {
    dispatch({ type: PICK_FIELDS, payload: {channelId, amount, addr} });

    browserHistory.push('/game');
};

export const resetChannel = () => (dispatch) => {
    dispatch({ type: RESET_CHANNEL});
};

export const setOpponentAddr = (addr, id) => (dispatch) => {
    dispatch({type: SET_OPPONENT_ADDR, payload: {addr, id} });
}

function createSession() {

    const wallet = ethers.Wallet.createRandom();

    return {
        wallet
    };
}