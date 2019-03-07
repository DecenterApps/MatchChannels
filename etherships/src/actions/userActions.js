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
    MATCH_STARTED,
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
import { receivedGuess, guessResponse, setOpponentTree, gameIsStarted, getCircularReplacer, resetBoard } from './boardActions';

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

    console.log('Price: ', price);
    dispatch({ type: NEW_GAME, payload: {price: window.web3.toWei(price, 'ether') } });

    // remove data stored from the previous game
    localStorage.removeItem('user');
    localStorage.removeItem('board');

    // create a wallet
    const newWallet = createWallet();
    localStorage.setItem('user', JSON.stringify({userWallet: newWallet}));

    dispatch({type: SET_WALLET, payload: newWallet});

    console.log('reset board');

    browserHistory.push('/game');

    resetBoard()(dispatch);
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
        // closeModal()(dispatch);
      });

      _conn.on('close', () => {
        if(getState().board.gameInProgress) {
          openModal('timeout', {})(dispatch);
        } else {
          browserHistory.push('/play');
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

    closeModal()(dispatch);

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
      browserHistory.push('/play');
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

    openModal('connection', {})(dispatch);    

  });
  conn.on('data', (message) => {
    msgReceived(message)(dispatch, getState);
  });
};

export const acceptChallenge = () => (dispatch, getState) => {
  const state = getState();

  const conn = webrtc.connectToPlayer(state.user.opponentPeerId);

  conn.on('open', () => {
    console.log('Conn open - challenger side');
    setConnection(conn, state.user.opponentPeerId, state.user.opponentChannel.valueOf())(dispatch);

    conn.on('close', () => {
      if(getState().board.gameInProgress) {
        openModal('timeout', {})(dispatch);
    } else {
      browserHistory.push('/play');
    }
    });

    getState().user.peer.disconnect();

    webrtc.send({
      type: 'challenge_accepted',
      channelId: state.modal.modalData.channelId,
      amount: state.modal.modalData.amount,
      addr: state.user.userAddr,
      opponentTree: state.board.tree,
    })
  });
  conn.on('data', (message) => {
    msgReceived(message)(dispatch, getState);
  });
};

export const declineChallenge = () => (dispatch) => {
  closeModal()(dispatch);

  webrtc.send({type: 'decline_challenge'});
};

export const matchStarted = () => (dispatch) => {
  dispatch({type: MATCH_STARTED});
};

export const msgReceived = (message) => (dispatch, getState) => {

  switch(message.type) {
    case 'challenge':
      if (getState().user.opponentChannel === -1) {
        console.log(message);
        setOpponentData(message.addr, message.channelId, message.opponentPeerId)(dispatch, getState);
        openModal('challenge', message)(dispatch);
      } else {
        webrtc.send({type: 'decline_challenge'});
      }
      break;
      
    case 'challenge_accepted':
      pickFields(message.channelId, message.amount, message.addr)(dispatch);
      setOpponentTree(message.opponentTree, message.channelId)(dispatch, getState);

      break;

    case 'decline_challenge': 
      console.log("DECLINED");
      closeModal()(dispatch);
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