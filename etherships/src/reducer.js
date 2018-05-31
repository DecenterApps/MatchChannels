import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import web3Reducer from './util/web3/web3Reducer';
import boardReducer from './reducers/boardReducer';

const reducer = combineReducers({
  routing: routerReducer,
  web3: web3Reducer,
  board: boardReducer,
})

export default reducer;
