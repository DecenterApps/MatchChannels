import { 
    SET_FIELD, 
    CREATE_TREE, 
    GUESS_FIELD, 
    SET_PLAYER_TURN, 
    LOAD_BOARD, 
    RESET_BOARD,
    CHECK_OPPONENTS_GUESS,
    GUESS_RESPONSE,
    SET_OPPONENT_TREE,
    START_GAME,
  } from '../constants/actionTypes';

import { EMPTY_FIELD, MISSED_SHIP, SUNK_SHIP, PLAYERS_SHIP, SECONDS_PER_TURN, TIMEOUT_WAIT_PERIOD } from '../constants/config';

const INITIAL_STATE = {
    // Here we show your ships and where the opponent hit/missed your ships
    board: [
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0],

    // Here we show which ships you hit or tried to hit
    opponentsBoard: [
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
    sequence: 0,
    opponentTree: [], //TODO: set this when the game starts
    isYourMove: false,
    choosenField: -1, // the current field that is selected but not submited
    gameTimer: SECONDS_PER_TURN,
    timeoutTimer: TIMEOUT_WAIT_PERIOD,
    numOfGuesses: 0,
    signatureNumOfGuesses: "",
    signatureResponse: {},
    gameInProgress: false,
};

export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_FIELD:
            const pos = payload;
            const board = state.board;

            let currPicked = state.numPicked;

            board[pos] = board[pos] ? EMPTY_FIELD : PLAYERS_SHIP;
            currPicked += board[pos] ? 1 : -1;

            return {
                ...state,
                numPicked: currPicked,
                board
            }

        case CREATE_TREE:
            return {
                ...state,
                ...payload
            };

        case GUESS_FIELD:
            let newBoard = state.opponentsBoard;
            newBoard[payload] = PLAYERS_SHIP;

            return {
                ...state,
                opponentsBoard: newBoard,
                choosenField: payload,
            }

        case SET_PLAYER_TURN:
            return {
                ...state,
                isYourMove: payload,
                opponentsBoard: state.opponentsBoard.map(b => b === PLAYERS_SHIP ? MISSED_SHIP : b),
                gameTimer: SECONDS_PER_TURN,
                sequence: ++state.sequence,
                choosenField: -1,
            }

        case CHECK_OPPONENTS_GUESS:
            const b = state.board;
            const position = payload;

            if (b[position] === PLAYERS_SHIP) {
                b[position] = SUNK_SHIP;
            } else if(b[position] === EMPTY_FIELD) {
                b[position] = MISSED_SHIP;
            }

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

        case GUESS_RESPONSE:
            let newBoardGuesses = state.opponentsBoard;

            if (payload.isShipHit) {
                newBoardGuesses[payload.pos] = SUNK_SHIP;
            }

            return {
                ...state,
                opponentsBoard: newBoardGuesses,
                numOfGuesses: payload.data.numOfGuesses,
                signatureNumOfGuesses: payload.data.signatureNumOfGuesses,
                signatureResponse: payload.data.disputeData.signatureResponse,
            }

        case SET_OPPONENT_TREE:
            return {
                ...state,
                opponentTree: payload,
            };
            
        case START_GAME:
            return {
                ...state,
                gameInProgress: true,
            };

        default:
            return {
                ...state
            };
    }

};