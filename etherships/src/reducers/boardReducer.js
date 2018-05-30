import { SET_FIELD } from '../constants/actionTypes';

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
    hashedBoard: [],
    nonces: [],
    numPicked: 0,
    numGuesses: 0
};

export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_FIELD:
            const pos = payload.pos;

            return {
                ...state,

            }
        break;

        default:
            return INITIAL_STATE;
    }

};