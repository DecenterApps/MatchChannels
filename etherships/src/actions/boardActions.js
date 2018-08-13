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
        GAME_FINISHED,
        SET_BLOCK_NUMBER,
        SELECT_SHIP,
        } from '../constants/actionTypes';

import { generateTree, checkGuess, checkResult, checkMerklePath, findShipsPaths } from '../services/boardService';
import { openChannel, joinChannel, closeChannel, getChannelInfo, disputeAnswer } from '../services/ethereumService';
import { getRoot } from '../util/merkle';
import * as webrtc from '../services/webrtcService';

import { openModal, closeModal } from './modalActions';

import { matchStarted } from './userActions';

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

    console.log(state.user.opponentChannel, getRoot(state.board.tree), state.user.peerId, walletAddress, state.user.gameBetAmount);

    if (state.user.opponentChannel === -1) {
        const tx = await openChannel(getRoot(state.board.tree), state.user.peerId, walletAddress, state.user.gameBetAmount);

        console.log("tx: ", tx.receipt.blockNumber);

        setBlockNumber(tx.receipt.blockNumber)(dispatch);

        browserHistory.push('/users');

        matchStarted()(dispatch);
    } else {
        const tx = await joinChannel(state.user.opponentChannel, getRoot(state.board.tree), state.user.peerId, walletAddress, state.user.gameBetAmount);

        setBlockNumber(tx.receipt.blockNumber)(dispatch);

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
        browserHistory.push('/users');
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
    if(getState().board.numOfGuesses <= payload.data.numOfGuesses) {
        dispatch({type: GUESS_RESPONSE, payload});

        //TODO: check if numOffGuess is the signature of your opponent
        const isOpponentSig = await checkResult(payload.data.disputeData.channelId, payload.data.signatureNumOfGuesses,
            getState().user.userAddr, getState().user.opponentAddr, getState().board.numOfGuesses);

        console.log("Is opponent sig: ", isOpponentSig);

        if (isOpponentSig) {
            const opponentTree = getState().board.opponentTree;

            const isPathCorrect = checkMerklePath(opponentTree, payload.pos, payload.isShipHit, payload.data.disputeData.nonce);

            if(!isPathCorrect) {
                openModal('dispute', {
                    pos: payload.pos,
                    nonce: payload.data.disputeData.nonce,
                    path: payload.data.disputeData.path,
                    type: payload.data.disputeData.type,
                    seq: payload.data.disputeData.sequence,
                    channelId: payload.data.disputeData.channelId,
                    sig: payload.data.disputeData.signatureResponse,
                })(dispatch);
            }

            const numHits = getState().board.opponentsBoard.filter(b => b === SUNK_SHIP).length;

            console.log('Guess Response: ', numHits, payload);

            if (numHits >= 5) {
                browserHistory.push('/users');
                openModal('endgame', {})(dispatch);
            }

            localStorage.setItem('board', JSON.stringify(getState().board));
        } else {
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

export const setOpponentTree = (opponentTree, channelId) => async (dispatch, getState) => {
    const channelInfo = await getChannelInfo(channelId);

    const root = opponentTree[6][0];

    if(channelInfo.p2root !== root && channelInfo.p1root !== root) {
        console.log('Omg he cheated!!!');

        localStorage.removeItem('user');
        localStorage.removeItem('board');

        dispatch({type: RESET_BOARD});

        closeModal()(dispatch);
        browserHistory.push('/');
    } else {
        console.log('You good fam!');
    }

    dispatch({type: SET_OPPONENT_TREE, payload: opponentTree});
};

export const gameIsStarted = () => (dispatch) => {
    dispatch({type: START_GAME});
};

export const submitScore = () => async (dispatch, getState) => {
    const state = getState();

    const opponentChannel = state.user.opponentChannel;
    const { signatureNumOfGuesses, numOfGuesses } = state.board;

    const { tree, board, nonces } = state.board;

    const closeInfo = findShipsPaths(tree, board, nonces);

    const res = await closeChannel(opponentChannel, signatureNumOfGuesses, numOfGuesses, closeInfo);

    console.log(res);

    localStorage.removeItem('user');
    localStorage.removeItem('board');

    dispatch({ type: GAME_FINISHED });
};

export const playAgain = () => (dispatch) => {
    closeModal()(dispatch);
    window.location.reload();
};

export const resetTurn = () => (dispatch, getState) => {
    dispatch({type: SET_PLAYER_TURN, payload: !getState().board.isYourMove})
};

export const submitDispute = (channelId, sig, pos, seq, type, nonce, path) => async (dispatch) => {
    const res = await disputeAnswer(channelId, sig, pos, seq, type, nonce, path);

    console.log(res);

    localStorage.removeItem('user');
    localStorage.removeItem('board');

    dispatch({type: RESET_BOARD});

    browserHistory.push('/');

    closeModal()(dispatch);
};

export const setBlockNumber = (blockNum) => (dispatch) => {
    dispatch({ type: SET_BLOCK_NUMBER, payload: blockNum})
};

export const selectShip = (type) => (dispatch) => {
    dispatch({ type: SELECT_SHIP, payload: type});
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
  