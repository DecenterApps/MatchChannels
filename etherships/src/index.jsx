import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';

// Layouts
import App from './App';
import Home from './Home';
import BoardCreationLayout from './game/BoardCreationLayout';
import Lobby from './lobby/Lobby';
import Profile from './profile/Profile';
import Match from './game/Match';
import Page404 from './Page404';

// Redux Store
import store from './store';

import Modal from 'react-modal';
import { setUpWeb3 } from './actions/userActions';
import PlayedMatches from './history/PlayedMatches';

// Initialize react-router-redux.
const history = syncHistoryWithStore(browserHistory, store);

// Initialize web3
window.addEventListener('load', async () => {
  setUpWeb3()(store.dispatch)
});

ReactDOM.render((
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={Home} />
          <Route path="game" component={BoardCreationLayout} />
          <Route path="users" component={Lobby} />
          <Route path="profile" component={Profile} />
          <Route path="match" component={Match} />
          <Route path="history" component={PlayedMatches} />
        </Route>
        <Route path='*' exact={true} component={Page404} />
      </Router>
    </Provider>
  ),
  document.getElementById('root')
);

Modal.setAppElement('#root');
