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
    SET_LOBBY_USERS,
    ADD_NEW_USER_TO_LOBBY,
    } from '../constants/actionTypes';

import { createPeer } from '../services/webrtcService';
import { createUser, getActiveChannels, getCurrentBlockNumber } from '../services/ethereumService';

import { NUM_BLOCKS_FOR_CHANNEL } from '../constants/config';

import { browserHistory } from 'react-router';
import short from 'short-uuid';

import ethers from 'ethers';

const createWallet = () => ({ wallet: ethers.Wallet.createRandom() });

export const register = () => async (dispatch, getState) => {
  const state = getState();

  await createUser(state.user.userNameEdit, state.user.priceEdit);

  dispatch({ type: REGISTERED, payload: createWallet() });

  browserHistory.push('/users');
};

export const newGame = (price) => (dispatch) => {
    dispatch({ type: NEW_GAME, payload: {price, session: createWallet() } });

    // remove data stored from the previous game
    localStorage.removeItem('user');
    localStorage.removeItem('board');

    browserHistory.push('/game');
};

export const setName = () => (dispatch) => {
    dispatch({ type: SET_NAME, payload: createWallet() });

    browserHistory.push('/game');
};

export const editName = ({ target }) => (dispatch) => {
    dispatch({ type: EDIT_NAME, payload: target.value });
};

export const editPrice = ({ target }) => (dispatch) => {
    dispatch({ type: EDIT_PRICE, payload: target.value });
};

// gets called on each refresh recreate data from localstorage
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

    dispatch({ type: LOAD_USER, payload: user});
    dispatch({ type: CREATE_PEER, payload: {peer, peerId} });
};

// sets the webrtc connection data to the reducer
export const setConnection = (connection, channelId) => (dispatch) => {
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
};


export const addUsersToLobby = () => async (dispatch) => {
    const users = await getActiveChannels();
    dispatch({type: SET_LOBBY_USERS, payload: users });

    const blockNum = await getCurrentBlockNumber();

    window.ethershipContract.OpenChannel({},{fromBlock: blockNum -  NUM_BLOCKS_FOR_CHANNEL, toBlock: 'latest' })
        .watch((err, user) => {
            if (!err) {
                dispatch({type: ADD_NEW_USER_TO_LOBBY, payload: user });
            }
        });
};