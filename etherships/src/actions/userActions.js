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
    SET_BALANCE,
    } from '../constants/actionTypes';

import * as webrtc from '../services/webrtcService';
import {
  createUser,
  getActiveChannels,
  getWeb3,
  fundUser,
  withdraw
} from '../services/ethereumService';

import { browserHistory } from 'react-router';
import short from 'short-uuid';

import ethers from 'ethers';
import { closeModal, openModal } from './modalActions';
import { receivedGuess, guessResponse, setOpponentTree, gameIsStarted, getCircularReplacer } from './boardActions';

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

export const fundAccount = (amount) => async (dispatch) => {

    await fundUser(amount);
    let type = 'fund';

    dispatch({ type: SET_BALANCE, payload: {amount, type} });
};

export const withdrawFunds = (amount) => async (dispatch) => {
    await withdraw(amount);
    let type = 'withdraw';

    dispatch({ type: SET_BALANCE, payload: {amount, type} });
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

   console.log("Peerid: ", peerId);

    if(!peerId) {
      peerId = short.uuid();

      localStorage.setItem('peer', peerId);
    }

    const peer = webrtc.createPeer(peerId);

    const board = localStorage.getItem('board');
    let user = localStorage.getItem('user');

    peer.on('connection', (_conn) => {

      _conn.on('open', (d) => {
        console.log('Conn open - receiver side', d);
        closeModal()(dispatch);
      });

      _conn.on('close', () => {
        if(getState().board.gameInProgress) {
          openModal('timeout', {})(dispatch);
        } else {
          browserHistory.push('/');
        }
      });

      _conn.on('data', (message) => {
        msgReceived(message)(dispatch, getState);
      });
    });

    if(user && board && JSON.parse(board).gameInProgress) {
      console.log('Reconnect');
      const connection = peer.connect(JSON.parse(user).opponentPeerId);
      webrtc.setWebRTCConnection(connection);
    }

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
export const setConnection = (connection, webrtcId, channelId) => (dispatch) => {
    dispatch({ type: SET_CONNECTION, payload: {connection, channelId, opponentPeerId: webrtcId} });
};

export const pickFields = (channelId, amount, addr, opponentTree) => (dispatch) => {
    dispatch({ type: PICK_FIELDS, payload: {channelId, amount, addr, opponentTree} });

    browserHistory.push('/game');
};

export const resetChannel = () => (dispatch) => {
    dispatch({ type: RESET_CHANNEL});
};

export const setOpponentData = (addr, id, opponentPeerId) => (dispatch, getState) => {
    dispatch({type: SET_OPPONENT_DATA, payload: {addr, id, opponentPeerId} });

    localStorage.setItem('user', JSON.stringify(getState().user, getCircularReplacer()));
};

export const connectToPlayer = (user) => (dispatch, getState) => {
  const conn = webrtc.connectToPlayer(user.webrtcId);

  conn.on('open', () => {
    console.log('Conn open - challenger side');
    setConnection(conn, user.webrtcId, user.channelId.valueOf())(dispatch);

    conn.on('close', () => {
      if(getState().board.gameInProgress) {
        openModal('timeout', {})(dispatch);
    } else {
      browserHistory.push('/');
    }
    });

    console.log('Challenge', getState().user);

    // send the challenge to the opponent
    webrtc.send({
      type: 'challenge',
      channelId: user.channelId.valueOf(),
      username: getState().user.username,
      amount: user.amount.valueOf(),
      addr: getState().user.userAddr,
      opponentPeerId: getState().user.peerId,
    });
    console.log('challenge sent');

  });
  conn.on('data', (message) => {
    msgReceived(message)(dispatch, getState);
  });
};

export const acceptChallenge = () => (dispatch, getState) => {
  const state = getState();

  webrtc.send({
    type: 'challenge_accepted',
    channelId: state.modal.modalData.channelId,
    amount: state.modal.modalData.amount,
    addr: state.user.userAddr,
    opponentTree: state.board.tree,
  })
};

export const msgReceived = (message) => (dispatch, getState) => {

  switch(message.type) {
    case 'challenge':
      console.log(message);
      setOpponentData(message.addr, message.channelId, message.opponentPeerId)(dispatch, getState);
      openModal('challenge', message)(dispatch);
      break;
      
    case 'challenge_accepted':
      pickFields(message.channelId, message.amount, message.addr)(dispatch);
      setOpponentTree(message.opponentTree, message.channelId)(dispatch, getState);
      break;

    case 'start_game':
      closeModal()(dispatch);
      browserHistory.push('/match');
      setOpponentTree(message.opponentTree, getState().user.opponentChannel)(dispatch, getState);
      gameIsStarted()(dispatch);

      localStorage.setItem('board', JSON.stringify(getState().board));
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

  window.ethershipContract.OpenChannel({},{})
    .watch((err, user) => {
      console.log('On event watch', user);

      if (!err) {
        dispatch({type: ADD_NEW_USER_TO_LOBBY, payload: user });
      }
    });
};