import { 
    SET_FIELD, 
    CREATE_TREE, 
    ON_CONTRACT, 
    GUESS_FIELD, 
    SET_PLAYER_MOVE, 
    CHECK_MOVE, 
    LOAD_BOARD, 
    RESET_BOARD,
    CHECK_MOVE_RESPONSE,
  } from '../constants/actionTypes';

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
    opponentBoard: [
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
    numHits: 0,
    numOpponentHits: 0,
    onContract: false,
    opponentTree: [],
    yourMove: false,
    recentGuess: -1,
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
            let newBoard = state.boardGuesses;
            newBoard[payload] = 1;

            return {
                ...state,
                boardGuesses: newBoard,
                recentGuess: payload
            }

        case SET_PLAYER_MOVE:
            return {
                ...state,
                yourMove: payload,
                boardGuesses: state.boardGuesses.map(b => b === 1 ? 2 : b),
            }

        case CHECK_MOVE:
            const b = state.board;
            let numHits = state.numOpponentHits;

            if (b[payload] === 1) {
                b[payload] = 3;
                numHits++;
            } else if(b[payload] === 0) {
                b[payload] = 2;
            }

            console.log('BOARD', b);

            return {
                ...state,
                board: b,
                numOpponentHits: numHits,
            }

        case LOAD_BOARD:

            return {
                ...state,
                ...payload
            }

        case RESET_BOARD:
            return INITIAL_STATE;

        case CHECK_MOVE_RESPONSE:

            let hits = state.numHits;

            let newBoardGuesses = state.boardGuesses;

            if (payload.result) {
                hits++;
                newBoardGuesses[payload.pos] = 3;
            }

            return {
                ...state,
                // numHits: hits,
                boardGuesses: newBoardGuesses,
            }


        default:
            return {
                ...state
            };
    }

};