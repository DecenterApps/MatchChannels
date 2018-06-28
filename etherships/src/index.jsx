import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import { getWeb3 } from './services/ethereumService';

// Layouts
import App from './App';
import Home from './Home';
import BoardCreationLayout from './game/BoardCreationLayout';
import Lobby from './lobby/Lobby';
import Profile from './profile/Profile';
import Match from './game/Match';

// Redux Store
import store from './store';

import Modal from 'react-modal';
import { LOAD_USER } from './constants/actionTypes';

// Initialize react-router-redux.
const history = syncHistoryWithStore(browserHistory, store);

// Initialize web3
getWeb3.then(async (user) => {
  store.dispatch({
      type: LOAD_USER,
      payload: user
    }
  );
  console.log('Web3 initialized!');
  console.log('User data: ', user);

  Modal.setAppElement('#root');

  ReactDOM.render((
      <Provider store={store}>
        <Router history={history}>
          <Route path="/" component={App}>
            <IndexRoute component={Home} />
            <Route path="game" component={BoardCreationLayout} />
            <Route path="users" component={Lobby} />
            <Route path="profile" component={Profile} />
            <Route path="match" component={Match} />
          </Route>
        </Router>
      </Provider>
    ),
    document.getElementById('root')
  );
}).catch((err) => {
  console.log('Error in web3 initialization.', err);
});

