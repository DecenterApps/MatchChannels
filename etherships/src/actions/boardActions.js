import { SET_FIELD, CREATE_TREE, ON_CONTRACT, GUESS_FIELD, SET_PLAYER_MOVE } from '../constants/actionTypes';

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

export const setPlayerMove = payload => (dispatch) => {
    dispatch({ type: SET_PLAYER_MOVE, payload });
};

export const generateBoard = (board, type) => async (dispatch, getState) => {

    const payload = generateTree(board);

    dispatch({ type: CREATE_TREE, payload });

    const state = getState();

    if (type === 'open') {

        const walletAddress = state.user.userWallet.address;

        console.log(getRoot(state.board.tree), state.user.peerId, walletAddress, state.user.gameBetAmount);

        if(state.user.opponentChannel === -1) {
            await openChannel(getRoot(state.board.tree), state.user.peerId, walletAddress, state.user.gameBetAmount);

            console.log('channel opened');

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

    } else {

    }
    
};