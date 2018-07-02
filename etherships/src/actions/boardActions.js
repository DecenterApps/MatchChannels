import { SET_FIELD, 
        CREATE_TREE, 
        ON_CONTRACT, 
        GUESS_FIELD, 
        SET_PLAYER_MOVE, 
        CHECK_MOVE,
        LOAD_BOARD,
        RESET_BOARD,
        CHECK_MOVE_RESPONSE,
        INCREMENT_SECONDS,
        } from '../constants/actionTypes';

import { generateTree, checkGuess } from '../services/boardService';
import { openChannel, joinChannel } from '../services/ethereumService';
import { getRoot } from '../util/merkel';
import * as webrtc from '../services/webrtcService';

import { openModal } from './modalActions';

import { browserHistory } from 'react-router'

export const setField = payload => (dispatch) => {
    dispatch({ type: SET_FIELD, payload });
};

export const guessField = payload => (dispatch) => {
    dispatch({ type: GUESS_FIELD, payload });
};

export const initBoard = () => (dispatch) => {
    let board = localStorage.getItem('board');

    if (board) {
        board = JSON.parse(board);
    }

    dispatch({ type: LOAD_BOARD, payload: board || {} });
};

export const submitGuess = payload => (dispatch) => {
    webrtc.send({type: 'move', pos: payload});
    dispatch({ type: SET_PLAYER_MOVE, payload: false });
};

export const generateBoard = (board) => async (dispatch, getState) => {
    const payload = generateTree(board);

    dispatch({ type: CREATE_TREE, payload });

    let state = getState();
    console.log(state.user.userWallet.address);
    const walletAddress = state.user.userWallet.address;

    if (state.user.opponentChannel === -1) {

        await openChannel(getRoot(state.board.tree), state.user.peerId, walletAddress, state.user.gameBetAmount);

        dispatch({type: ON_CONTRACT});

        browserHistory.push('/users');
    } else {
        await joinChannel(state.user.opponentChannel, getRoot(state.board.tree), state.user.peerId, walletAddress, state.user.gameBetAmount);

        dispatch({ type: SET_PLAYER_MOVE, payload: true });

        // notify other user
        webrtc.send({type: 'start_game'});

        browserHistory.push('/match');
    }

    // delete state.user.peer;

    // save data to localStorage so we don't lose it on refresh
    localStorage.setItem('user', JSON.stringify(state.user, getCircularReplacer()));
    localStorage.setItem('board', JSON.stringify(state.board, getCircularReplacer()))
};

// this is called when we receive a guess from the opponent
export const checkMove = pos => (dispatch, getState) => {
    let state = getState();

    let result = false;

    // check if user hit your ship
    if (state.board.board[pos] === 1) {
        result = true;
    }

    // reset your turn
    dispatch({ type: CHECK_MOVE, payload: pos });
    dispatch({ type: SET_PLAYER_MOVE, payload: true });

    // get the updated state
    state = getState();

    const numHits = state.board.board.filter(b => b === 3).length;

    console.log('board: ', state.board.board, " board guess: ", state.board.boardGuesses);

    if (state.board.board.filter(b => b === 3).length >= 5) {
        openModal('endgame', {})(dispatch);
    }

    const channelId = state.user.opponentChannel;
    const merkelTree = state.board.tree;
    const hashedFields = state.board.hashedBoard;
    const nonces = state.board.nonces;
    const sequence = state.board.sequence;
    const addr = state.user.opponentAddr;

    const data = checkGuess(state, channelId, pos, merkelTree, hashedFields, nonces, sequence, numHits, addr);

    // send the result to the opponent
    webrtc.send({type: 'move-resp', result, pos, data });
};

// this is called when the opponent responds to your guess
export const checkMoveResponse = payload => async (dispatch, getState) => {
    if (payload.pos) {
        dispatch({type: CHECK_MOVE_RESPONSE, payload});

        const numHits = getState().board.boardGuesses.filter(b => b === 3).length;

        console.log('Response numHits: ', numHits);

        if (numHits >= 5) {
            openModal('endgame', {})(dispatch);
        }
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
  