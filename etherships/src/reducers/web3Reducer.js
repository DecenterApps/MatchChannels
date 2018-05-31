import { WEB3_INITIALIZED } from '../constants/actionTypes';

const INITIAL_STATE = {
  web3Instance: null,
  contractInstance: null,
}

export default (state = INITIAL_STATE, action) => {
  const { type, payload } = action;

  switch (type) {
    case WEB3_INITIALIZED: 
      return {
        ...state,
        web3Instance: payload.web3Instance
      }

    default:
      return state;
  }

};