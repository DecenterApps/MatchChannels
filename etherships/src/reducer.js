import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import boardReducer from './reducers/boardReducer';
import userReducer from './reducers/userReducer';
import modalReducer from './reducers/modalReducer';

const reducer = combineReducers({
  routing: routerReducer,
  board: boardReducer,
  user: userReducer,
  modal: modalReducer,
});

export default reducer;
