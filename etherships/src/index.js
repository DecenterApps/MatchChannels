import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import getWeb3 from './util/web3/getWeb3';

// Layouts
import App from './App';
import Home from './Home';
import BoardCreationLayout from './game/BoardCreationLayout';
import UserList from './lobby/UserList';

// Redux Store
import store from './store';

// Initialize react-router-redux.
const history = syncHistoryWithStore(browserHistory, store);

// Initialize web3 and set in Redux.
getWeb3
.then(results => {
  console.log('Web3 initialized!')
})
.catch(() => {
  console.log('Error in web3 initialization.')
})

ReactDOM.render((
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={Home} />
          <Route path="game" component={BoardCreationLayout} />
          <Route path="users" component={UserList} />
        </Route>
      </Router>
    </Provider>
  ),
  document.getElementById('root')
)
