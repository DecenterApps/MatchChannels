import { SET_FIELD, 
        CREATE_TREE, 
        GUESS_FIELD, 
        LOAD_BOARD,
        RESET_BOARD,
        SET_PLAYER_TURN,
        GUESS_RESPONSE,
        CHECK_OPPONENTS_GUESS,
        INCREMENT_SECONDS,
        } from '../constants/actionTypes';

import { generateTree, checkGuess } from '../services/boardService';
import { openChannel, joinChannel } from '../services/ethereumService';
import { getRoot } from '../util/merkel';
import * as webrtc from '../services/webrtcService';

import { openModal } from './modalActions';

import { SUNK_SHIP } from '../constants/config';

import { browserHistory } from 'react-router'

export const setField = payload => (dispatch) => {
    dispatch({ type: SET_FIELD, payload });
};

export const guessField = pos => (dispatch) => {
    dispatch({ type: GUESS_FIELD, payload: pos });

    webrtc.send({type: 'received_guess', pos});
    dispatch({ type: SET_PLAYER_TURN, payload: false });
};

export const initBoard = () => (dispatch) => {
    let board = localStorage.getItem('board');

    if (board) {
        board = JSON.parse(board);
    }

    dispatch({ type: LOAD_BOARD, payload: board || {} });
};

export const generateBoard = (board) => async (dispatch, getState) => {
    const payload = generateTree(board);

    dispatch({ type: CREATE_TREE, payload });

    let state = getState();
    const walletAddress = state.user.userWallet.wallet.address;

    console.log('Wallet address: ', walletAddress);


    if (state.user.opponentChannel === -1) {
        await openChannel(getRoot(state.board.tree), state.user.peerId, walletAddress, state.user.gameBetAmount);

        browserHistory.push('/users');
    } else {
        await joinChannel(state.user.opponentChannel, getRoot(state.board.tree), state.user.peerId, walletAddress, state.user.gameBetAmount);

        dispatch({ type: SET_PLAYER_TURN, payload: true });

        // notify other user
        webrtc.send({type: 'start_game'});

        browserHistory.push('/match');
    }

    // save data to localStorage so we don't lose it on refresh
    localStorage.setItem('user', JSON.stringify(state.user, getCircularReplacer()));
    localStorage.setItem('board', JSON.stringify(state.board, getCircularReplacer()))
};

// this is called when we receive a guess from the opponent
export const receivedGuess = pos => (dispatch, getState) => {
    dispatch({ type: CHECK_OPPONENTS_GUESS, payload: pos });

    // get the updated state
    const state = getState();

    const numHits = state.board.board.filter(b => b === SUNK_SHIP).length;

    if (numHits >= 5) {
        openModal('endgame', {})(dispatch);
    }

    const data = checkGuess(state, pos, numHits);

    console.log("Recevied Guess: ", numHits, data);

    const isShipHit = state.board.board[pos] === SUNK_SHIP;
    webrtc.send({type: 'guess_response', isShipHit, pos, data });

    // You received a guess, now it's your turn
    dispatch({ type: SET_PLAYER_TURN, payload: true });
};

// this is called when the opponent responds to your guess
export const guessResponse = payload => async (dispatch, getState) => {
    dispatch({type: GUESS_RESPONSE, payload});

    const numHits = getState().board.opponentsBoard.filter(b => b === SUNK_SHIP).length;

    console.log('Guess Response: ', numHits, payload);

    if (numHits >= 5) {
        openModal('endgame', {})(dispatch);
    }
};

export const resetBoard = () => (dispatch) => {
    dispatch({type: RESET_BOARD});
};

export const incrementSeconds = () => dispatch => {
    dispatch({type: INCREMENT_SECONDS });
};

export const submitScore = () => () => {
    localStorage.removeItem('user');
    localStorage.removeItem('board');

    browserHistory.push('/users');
};

// helper function to help stringify deal with circual referencing in json
const getCircularReplacer = () => {
    const seen = new WeakSet;
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };
  