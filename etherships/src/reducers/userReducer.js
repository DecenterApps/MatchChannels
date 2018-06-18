import { SET_NAME, 
        EDIT_NAME, 
        EDIT_PRICE, 
        REGISTERED, 
        IS_REGISTERED, 
        NEW_GAME, 
        CREATE_PEER,
        SET_CONNECTION,
        PICK_FIELDS,
        LOAD_USER,
        } from '../constants/actionTypes';

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
    connection: {},
    peerId: "",
    userWallet: {},
    registered: false,
    opponentChannel: -1,
};

export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_NAME:

            return {
                ...state,
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
                userWallet: payload.wallet,
                userName: state.userNameEdit,
                userNameEdit: '',
            }

        case IS_REGISTERED:

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
                userWallet: payload.session.wallet
            };

        case CREATE_PEER:

            return {
                ...state,
                peer: payload.peer,
                peerId: payload.peerId
            };

        case SET_CONNECTION:

            return {
                ...state,
                connection: payload.connection,
                userWallet: payload.wallet
            };

        case PICK_FIELDS:

            return {
                ...state,
                opponentChannel: payload.channelId,
                gameBetAmount: payload.amount
            };

        case LOAD_USER:

            return {
                ...state,
                ...payload,
            };

        default:
            return {
                ...state
            };
    }

};