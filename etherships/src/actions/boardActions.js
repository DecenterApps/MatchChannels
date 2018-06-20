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
        TOGGLE_ENDGAME_MODAL,
        } from '../constants/actionTypes';

import { generateTree } from '../services/boardService';
import { openChannel, joinChannel } from '../services/ethereumService';
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

    state.user.connection.send({type: 'move-resp', result, pos });

    dispatch({ type: SET_PLAYER_MOVE, payload: true });

    const numHits = getState().board.board.filter(b => b === 3).length;

    console.log('numHits: ', numHits);

    if (numHits >= 5) {
        dispatch({type: TOGGLE_ENDGAME_MODAL});
    }
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

export const checkMoveResponse = payload => (dispatch, getState) => {
    if (payload.pos) {

        dispatch({type: CHECK_MOVE_RESPONSE, payload});

        const numHits = getState().board.boardGuesses.filter(b => b === 3).length;

        console.log('numHits: ', numHits);

        if (numHits >= 5) {
            dispatch({type: TOGGLE_ENDGAME_MODAL});
        }
    }
};

export const incrementSeconds = () => dispatch => {
    dispatch({type: INCREMENT_SECONDS });
};

export const toggleEndGameModal = () => dispatch => {
    dispatch({type: TOGGLE_ENDGAME_MODAL});
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
  