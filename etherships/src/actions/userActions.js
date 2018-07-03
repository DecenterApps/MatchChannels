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
    SET_OPPONENT_DATA,
    SET_LOBBY_USERS,
    ADD_NEW_USER_TO_LOBBY,
    SET_WALLET,
    } from '../constants/actionTypes';

import * as webrtc from '../services/webrtcService';
import {
  createUser,
  getActiveChannels,
  getCurrentBlockNumber,
  getWeb3
} from '../services/ethereumService';

import { browserHistory } from 'react-router';
import short from 'short-uuid';

import ethers from 'ethers';
import { closeModal, openModal } from './modalActions';
import { receivedGuess, guessResponse } from './boardActions';

const createWallet = () => ({ wallet: ethers.Wallet.createRandom() });

export const setUpWeb3 = () => (dispatch) => {
  getWeb3().then((user) => {
    dispatch({
        type: LOAD_USER,
        payload: {
          ...user,
          userError: '',
        }
      }
    );
    console.log('Web3 initialized!');
    console.log('User data: ', user);
  }).catch((err) => {
    console.log('Error in web3 initialization.', err);
    dispatch({
        type: LOAD_USER,
        payload: {
          userError: err
        }
      }
    );
    setTimeout(() => setUpWeb3()(dispatch), 1000)
  })
};

export const register = () => async (dispatch, getState) => {
  const state = getState();

  await createUser(state.user.userNameEdit, state.user.priceEdit);

  dispatch({ type: REGISTERED });

  browserHistory.push('/users');
};

export const newGame = (price) => (dispatch) => {
    dispatch({ type: NEW_GAME, payload:  {price } });

    // remove data stored from the previous game
    localStorage.removeItem('user');
    localStorage.removeItem('board');

    // create a wallet
    const newWallet = createWallet();
    localStorage.setItem('user', JSON.stringify({userWallet: newWallet}));

    dispatch({type: SET_WALLET, payload: newWallet});

    browserHistory.push('/game');
};

export const setName = () => (dispatch) => {
    dispatch({ type: SET_NAME });

    browserHistory.push('/game');
};

export const editName = ({ target }) => (dispatch) => {
    dispatch({ type: EDIT_NAME, payload: target.value });
};

export const editPrice = ({ target }) => (dispatch) => {
    dispatch({ type: EDIT_PRICE, payload: target.value });
};

// gets called on each refresh recreate data from localstorage
export const initAccount = () => (dispatch, getState) =>  {
    let peerId = localStorage.getItem('peer');

    if(!peerId) {
      peerId = short.uuid();

      localStorage.setItem('peer', peerId);
    }

    const peer = webrtc.createPeer(peerId);
    peer.on('connection', (_conn) => {
      _conn.on('open', () => {
        console.log('Conn open - receiver side');
        // setConnection(_conn)(dispatch);
        // webrtc.setConnection(_conn);
      });
      _conn.on('data', (message) => {
        msgReceived(message)(dispatch, getState);
      });
    });

    let user = localStorage.getItem("user");

    const userWallet = createWallet();
    console.log('Creating a new wallet!!!');

    if (!user) {
      user = { userWallet };

      localStorage.setItem('user', JSON.stringify(user));
    } else {
      user = JSON.parse(user);

      user.userWallet = { wallet: new ethers.Wallet(user.userWallet.wallet.privateKey) };
    }

    dispatch({ type: LOAD_USER, payload: user});
    dispatch({ type: CREATE_PEER, payload: {peer, peerId} });
};

// sets the webrtc connection data to the reducer
export const setConnection = (connection, channelId) => (dispatch) => {
    dispatch({ type: SET_CONNECTION, payload: {connection, channelId} });
};

export const pickFields = (channelId, amount, addr) => (dispatch) => {
    dispatch({ type: PICK_FIELDS, payload: {channelId, amount, addr} });

    browserHistory.push('/game');
};

export const resetChannel = () => (dispatch) => {
    dispatch({ type: RESET_CHANNEL});
};

export const setOpponentData = (addr, id) => (dispatch) => {
    dispatch({type: SET_OPPONENT_DATA, payload: {addr, id} });
};

export const connectToPlayer = (user) => (dispatch, getState) => {
  const conn = webrtc.connectToPlayer(user.webrtcId);

  conn.on('open', () => {
    console.log('Conn open - challenger side');
    setConnection(conn, user.webrtcId, user.channelId.valueOf())(dispatch);

    // send the challenge to the opponent
    webrtc.send({
      type: 'challenge',
      channelId: user.channelId.valueOf(),
      username: getState().user.userName,
      amount: user.amount.valueOf(),
      addr: getState().user.userAddr,
    });
    console.log('challenge sent');

  });
  conn.on('data', (message) => {

    msgReceived(message)(dispatch, getState);
  });
};

export const acceptChallenge = () => (dispatch, getState) => {
  webrtc.send({
    type: 'challenge_accepted',
    channelId: getState().modal.modalData.channelId, // should perhaps be moved
    amount: getState().modal.modalData.amount,
    addr: getState().user.userAddr,
  })
};

export const msgReceived = (message) => (dispatch, getState) => {

  switch(message.type) {
    case 'challenge':
      setOpponentData(message.addr, message.channelId)(dispatch);
      openModal('challenge', message)(dispatch);
      break;
      
    case 'challenge_accepted':
      pickFields(message.channelId, message.amount, message.addr)(dispatch);
      break;

    case 'start_game':
      closeModal()(dispatch);
      browserHistory.push('/match');
      break;

    case 'received_guess':
      receivedGuess(message.pos)(dispatch, getState);
      break;

    case 'guess_response':
      guessResponse(message)(dispatch, getState);
      break;

    default:
      console.log("Unknown message type", message);
  }
};

export const addUsersToLobby = () => async (dispatch) => {
  const users = await getActiveChannels();
  dispatch({type: SET_LOBBY_USERS, payload: users });

  const blockNum = await getCurrentBlockNumber();

  // TODO: disabled temporarily as it brings up channels that are joined
  // window.ethershipContract.OpenChannel({},{fromBlock: blockNum -  NUM_BLOCKS_FOR_CHANNEL, toBlock: 'latest' })
  //   .watch((err, user) => {
  //     console.log('On event watch', user);

  //     if (!err) {
  //       dispatch({type: ADD_NEW_USER_TO_LOBBY, payload: user });
  //     }
  //   });
};