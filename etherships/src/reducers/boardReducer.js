import { SET_FIELD, CREATE_TREE, ON_CONTRACT, GUESS_FIELD, SET_PLAYER_MOVE } from '../constants/actionTypes';

const INITIAL_STATE = {
    board: [  
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0],
    boardGuesses: [  
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0],
    tree: [],
    nonces: [],
    hashedBoard: [],
    numPicked: 0,
    numGuesses: 0,
    onContract: false,
    opponentTree: [],
    yourMove: false,
};

export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_FIELD:
            const pos = payload;
            const board = state.board;

            board[pos] = 1;

            return {
                ...state,
                numPicked: ++state.numPicked,
                board
            }

        case CREATE_TREE:
            return {
                ...state,
                ...payload
            };

        case ON_CONTRACT:
            return {
                ...state,
                onContract: true
            }

        case GUESS_FIELD:
            let newBoard = state.board.fill(0);

            newBoard[payload] = 1;

            return {
                ...state,
                boardGuesses: newBoard
            }

        case SET_PLAYER_MOVE:
            return {
                ...state,
                yourMove: payload
            }


        default:
            return {
                ...state
            };
    }

};