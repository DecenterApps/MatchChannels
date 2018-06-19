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
    INCREMENT_SECONDS,
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
    onContract: false,
    opponentTree: [],
    yourMove: false,
    recentGuess: -1,
    timer: 30,
    seconds: 0,
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
                timer: 30,
                seconds: 0,
            }

        case CHECK_MOVE:
            const b = state.board;

            if (b[payload] === 1) {
                b[payload] = 3;
            } else if(b[payload] === 0) {
                b[payload] = 2;
            }

            console.log('BOARD', b);

            return {
                ...state,
                board: b,
            }

        case LOAD_BOARD:

            return {
                ...state,
                ...payload
            }

        case RESET_BOARD:
            return INITIAL_STATE;

        case CHECK_MOVE_RESPONSE:
            let newBoardGuesses = state.boardGuesses;

            if (payload.result) {
                console.log('Setting newBoard', payload);
                newBoardGuesses[payload.pos] = 3;
            }

            return {
                ...state,
                boardGuesses: newBoardGuesses,
            }

        case INCREMENT_SECONDS:
            return {
                ...state,
                seconds: ++state.seconds
            };


        default:
            return {
                ...state
            };
    }

};