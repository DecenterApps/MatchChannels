import _ from 'lodash';

import { SET_NAME,
        SET_ADDR,
        EDIT_NAME,
        EDIT_PRICE, 
        REGISTERED, 
        IS_REGISTERED, 
        NEW_GAME, 
        CREATE_PEER,
        SET_CONNECTION,
        PICK_FIELDS,
        LOAD_USER,
        SET_OPPONENT_ADDR,
        SET_LOBBY_USERS,
        ADD_NEW_USER_TO_LOBBY,
        } from '../constants/actionTypes';

const INITIAL_STATE = {
    userAddr: "",
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
    opponentAddr: ""
};

export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_NAME:

            console.log('wallet addr: ', payload.wallet.address);

            return {
                ...state,
                userName: state.userNameEdit,
                userNameEdit: '',
            }

        case SET_ADDR:
            console.log('payload', payload.addr);

            return {
                ...state,
                userAddr: payload.addr
            }

        case EDIT_NAME: 

            return {
                ...state,
                userNameEdit: payload
            }

        case REGISTERED:

            console.log('wallet addr: ', payload.wallet.address);

            return {
                ...state,
                registered: true,
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

            console.log('wallet addr: ', payload.session.wallet.address);

            return {
                ...state,
                gameBetAmount: payload.price,
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
                opponentChannel: payload.channelId || state.opponentChannel,
            };

        case PICK_FIELDS:
            console.log('pick_fields: ', payload.channelId);

            return {
                ...state,
                opponentChannel: payload.channelId,
                gameBetAmount: payload.amount,
                opponentAddr: payload.addr,
            };

        case LOAD_USER:

            return {
                ...state,
                ...payload,
            };

        case SET_OPPONENT_ADDR:
            return {
                ...state,
                opponentAddr: payload.addr,
                opponentChannel: payload.id,
            };

        case SET_LOBBY_USERS:
            return {
                ...state,
                usersList: payload,
            };
        
        case ADD_NEW_USER_TO_LOBBY:

            let newUsersList = state.usersList;
            const exists = state.usersList.find(u => u.args.channelId.valueOf() === payload.args.channelId.valueOf());

            if(!exists) {
                newUsersList.push(payload);
            }

            return {
                ...state,
                usersList: newUsersList,
            };

        default:
            return {
                ...state
            };
    }

};