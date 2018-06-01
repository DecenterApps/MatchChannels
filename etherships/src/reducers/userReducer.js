import { SET_NAME, EDIT_NAME } from '../constants/actionTypes';

const INITIAL_STATE = {
    userNameEdit: "",
    userName: "",
    usersList: [],
    peer: {}
};

export default (state = INITIAL_STATE, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_NAME:

            return {
                ...state,
                peer: payload,
                userName: state.userNameEdit,
                userNameEdit: '',
            }

        case EDIT_NAME: 

            return {
                ...state,
                userNameEdit: payload
            }

        default:
            return {
                ...state
            };
    }

};