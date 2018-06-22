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
        OPEN_ENDGAME_MODAL,
        CLOSE_ENDGAME_MODAL,
        } from '../constants/actionTypes';

import { generateTree, checkGuess } from '../services/boardService';
import { openChannel, joinChannel, closeChannel } from '../services/ethereumService';
import { getRoot } from '../util/merkel';

import { browserHistory } from 'react-router'

export const setField = payload => (dispatch) => {
    dispatch({ type: SET_FIELD, payload });
};

export const guessField = payload => (dispatch) => {
    dispatch({ type: GUESS_FIELD, payload });
};

export const initBoard = payload => (dispatch) => {

    let board = localStorage.getItem('board');

    if (board) {
        board = JSON.parse(board);
    }

    dispatch({ type: LOAD_BOARD, payload: board || {} });
};

export const checkMove = pos => (dispatch, getState) => {
    console.log('check move');

    const state = getState();

    let result = false;

    // check if user hit your ship
    if (state.board.board[pos] === 1) {
        result = true;
    }

    // reset your turn
    dispatch({ type: CHECK_MOVE, payload: pos });

    dispatch({ type: SET_PLAYER_MOVE, payload: true });

    const numHits = getState().board.board.filter(b => b === 3).length;

    console.log(getState().board.board);

    console.log('CheckMove numHits: ', numHits);

    if (numHits >= 5) {
        dispatch({type: OPEN_ENDGAME_MODAL});
    }

    const channelId = state.user.opponentChannel;
    const merkelTree = state.board.tree;
    const hashedFields = state.board.hashedBoard;
    const nonces = state.board.nonces;
    const sequence = state.board.sequence;
    const addr = state.user.opponentAddr;

    console.log(channelId, pos, merkelTree, hashedFields, nonces, sequence, numHits, addr);

    const data = checkGuess(state, channelId, pos, merkelTree, hashedFields, nonces, sequence, numHits, addr);

    console.log(data);

    state.user.connection.send({type: 'move-resp', result, pos, data });
};

export const submitGuess = payload => (dispatch, getState) => {
    const state = getState().user;

    state.connection.send({type: 'move', pos: payload});

    dispatch({ type: SET_PLAYER_MOVE, payload: false });
};

export const generateBoard = (board) => async (dispatch, getState) => {
    const payload = generateTree(board);

    dispatch({ type: CREATE_TREE, payload });

    let state = getState();

    const walletAddress = state.user.userWallet.address;

    console.log(getRoot(state.board.tree), state.user.peerId, walletAddress, state.user.gameBetAmount);

    if(state.user.opponentChannel === -1) {
        await openChannel(getRoot(state.board.tree), state.user.peerId, walletAddress, state.user.gameBetAmount);

        dispatch({type : ON_CONTRACT, payload: null});

        browserHistory.push('/users');
    } else {
        console.log('join channel');

        await joinChannel(state.user.opponentChannel, getRoot(state.board.tree), state.user.peerId, walletAddress, state.user.gameBetAmount);

        dispatch({ type: SET_PLAYER_MOVE, payload: true });

        // notify other user
        state.user.connection.send({type: 'start_game'});

        browserHistory.push('/match');
    }

    delete state.user.peer;

    localStorage.setItem('user', JSON.stringify(state.user, getCircularReplacer()));
    localStorage.setItem('board', JSON.stringify(state.board, getCircularReplacer()))
};

export const resetBoard = payload => (dispatch) => {
    dispatch({type: RESET_BOARD});
};

export const checkMoveResponse = payload => async (dispatch, getState) => {
    if (payload.pos) {
        dispatch({type: CHECK_MOVE_RESPONSE, payload});

        const numHits = getState().board.boardGuesses.filter(b => b === 3).length;

        console.log('Response numHits: ', numHits);

        if (numHits >= 5) {
            dispatch({type: OPEN_ENDGAME_MODAL});
        }
    }
};

export const incrementSeconds = () => dispatch => {
    dispatch({type: INCREMENT_SECONDS });
};

export const openEndGameModal = () => dispatch => {
    dispatch({type: OPEN_ENDGAME_MODAL});
};

export const closeEndGameModal = () => dispatch => {
    dispatch({type: CLOSE_ENDGAME_MODAL});
};


export const submitScore = () => dispatch => {

    // call ethereum service 

    localStorage.removeItem('user');
    localStorage.removeItem('board');

    browserHistory.push('/users');
};

// helper function to help stringify 
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
  