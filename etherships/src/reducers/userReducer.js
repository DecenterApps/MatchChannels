import { SET_NAME, EDIT_NAME, EDIT_PRICE, REGISTERED, IS_REGISTERED, NEW_GAME } from '../constants/actionTypes';

const INITIAL_STATE = {
    userNameEdit: "",
    userName: "",
    priceEdit: "",
    editPrice: "",
    gameBetAmount: 0,
    balance: 0,
    gamesPlayed: 0,
    finishedGames: 0,
    usersList: [],
    peer: {},
    userWallet: {},
    registered: false
};

export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_NAME:

            return {
                ...state,
                peer: payload.peer,
                userWallet: payload.wallet,
                userName: state.userNameEdit,
                userNameEdit: '',
            }

        case EDIT_NAME: 

            return {
                ...state,
                userNameEdit: payload
            }

        case REGISTERED:

            return {
                ...state,
                registered: true,
                peer: payload.peer,
                userWallet: payload.wallet,
                userName: state.userNameEdit,
                userNameEdit: '',
            }

        case IS_REGISTERED:

            console.log(payload);

            return {
                ...state,
                userName: payload.username,
                userNameEdit: payload.username,
                balance: payload.balance,
                gamesPlayed: payload.gamesPlayed,
                finishedGames: payload.finishedGames,
                registered: true
            };

        case EDIT_PRICE:

            return {
                ...state,
                priceEdit: payload,
            };

        case NEW_GAME:

            return {
                ...state,
                gameBetAmount: payload.price,
                peer: payload.session.peer,
                userWallet: payload.session.wallet
            };

        default:
            return {
                ...state
            };
    }

};