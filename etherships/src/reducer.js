import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import web3Reducer from './reducers/web3Reducer';
import boardReducer from './reducers/boardReducer';
import userReducer from './reducers/userReducer';

const reducer = combineReducers({
  routing: routerReducer,
  web3: web3Reducer,
  board: boardReducer,
  user: userReducer,
})

export default reducer;
