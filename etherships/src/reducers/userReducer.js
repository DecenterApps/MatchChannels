
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
        SET_OPPONENT_DATA,
        SET_LOBBY_USERS,
        ADD_NEW_USER_TO_LOBBY,
        SET_WALLET,
        SET_BALANCE,
        } from '../constants/actionTypes';

const INITIAL_STATE = {
    userAddr: "",
    userError: "",
    userNameEdit: "",
    username: "",
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
    registered: false,
    opponentChannel: -1,
    opponentAddr: "",
    opponentPeerId: "",
    userWallet: {},
    hasCreatedMatch: false, // if the user already created a channel
};

export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_NAME:
            return {
                ...state,
                username: state.userNameEdit,
                userNameEdit: '',
            }

        case SET_ADDR:
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
            return {
                ...state,
                registered: true,
                username: state.userNameEdit,
                userNameEdit: '',
            };

        case SET_BALANCE:
            // if withdraw then decrease balance, else increase
            return {
                ...state,
                balance: (payload.type === 'withdraw') ? parseFloat(state.balance) - parseFloat(payload.amount) : parseFloat(state.balance) + parseFloat(payload.amount)
            };

        case IS_REGISTERED:

            return {
                ...state,
                username: payload.username,
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
                opponentChannel: -1,
            };

        case CREATE_PEER:

            return {
                ...state,
                peer: payload.peer,
                peerId: payload.peerId
            };

        case SET_CONNECTION:
            console.log('Opponent peer id: ', payload.opponentPeerId);

            return {
                ...state,
                connection: payload.connection,
                opponentChannel: payload.channelId || state.opponentChannel,
                opponentPeerId: payload.opponentPeerId,
            };

        case PICK_FIELDS:
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

        case SET_OPPONENT_DATA:
            return {
                ...state,
                opponentAddr: payload.addr,
                opponentChannel: payload.id,
                opponentPeerId: payload.opponentPeerId,
            };

        case SET_LOBBY_USERS:
            console.log([...state.usersList, ...payload]);

            const hasCreatedMatch = [...state.usersList, ...payload].find(u => u.args.addr === state.userAddr);

            console.log(hasCreatedMatch);

            return {
                ...state,
                usersList: payload,
                hasCreatedMatch,
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

        case SET_WALLET:
            return {
                ...state,
                userWallet: payload,
            };

        default:
            return {
                ...state
            };
    }

};