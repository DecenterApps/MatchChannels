import { SET_FIELD, 
        CREATE_TREE, 
        GUESS_FIELD, 
        LOAD_BOARD,
        RESET_BOARD,
        SET_PLAYER_TURN,
        GUESS_RESPONSE,
        CHECK_OPPONENTS_GUESS,
        INCREMENT_SECONDS,
        SET_OPPONENT_TREE,
        START_GAME,
        } from '../constants/actionTypes';

import { generateTree, checkGuess } from '../services/boardService';
import { openChannel, joinChannel, closeChannel } from '../services/ethereumService';
import { getRoot } from '../util/merkel';
import * as webrtc from '../services/webrtcService';

import { openModal, closeModal } from './modalActions';

import { SUNK_SHIP } from '../constants/config';

import { browserHistory } from 'react-router';

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

        console.log('Join tree: ', state.board.tree);

        // notify other user
        webrtc.send({type: 'start_game', opponentTree: state.board.tree});

        gameIsStarted()(dispatch);

        browserHistory.push('/match');
    }

    // save data to localStorage so we don't lose it on refresh
    localStorage.setItem('user', JSON.stringify(getState().user, getCircularReplacer()));
    localStorage.setItem('board', JSON.stringify(getState().board, getCircularReplacer()))
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

    localStorage.setItem('board', JSON.stringify(getState().board));
};

// this is called when the opponent responds to your guess
export const guessResponse = payload => async (dispatch, getState) => {
    dispatch({type: GUESS_RESPONSE, payload});

    const numHits = getState().board.opponentsBoard.filter(b => b === SUNK_SHIP).length;

    console.log('Guess Response: ', numHits, payload);

    if (numHits >= 5) {
        openModal('endgame', {})(dispatch);
    }

    localStorage.setItem('board', JSON.stringify(getState().board));
};

export const resetBoard = () => (dispatch) => {
    dispatch({type: RESET_BOARD});
};

export const incrementSeconds = () => dispatch => {
    dispatch({type: INCREMENT_SECONDS });
};

export const setOpponentTree = (opponentTree) => dispatch => {
    dispatch({type: SET_OPPONENT_TREE, payload: opponentTree});
};

export const gameIsStarted = () => (dispatch) => {
    dispatch({type: START_GAME});
};

export const submitScore = () => async (dispatch, getState) => {
    const state = getState();

    const opponentChannel = state.user.opponentChannel;
    const { signatureNumOfGuesses, numOfGuesses } = state.board;

    console.log(opponentChannel, signatureNumOfGuesses, numOfGuesses);

    const res = await closeChannel(opponentChannel, signatureNumOfGuesses, numOfGuesses);

    console.log(res);

    localStorage.removeItem('user');
    localStorage.removeItem('board');

    browserHistory.push('/users');

    closeModal()(dispatch);
};

// helper function to help stringify deal with circual referencing in json
export const getCircularReplacer = () => {
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
  