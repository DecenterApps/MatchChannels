import React, { Component } from 'react'

import { createPeer } from './services/webrtcService';

import { connect } from 'react-redux';

import { initAccount } from './actions/userActions';

// Styles
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {

  componentDidMount() {
    this.props.initAccount();
  }

  render() {
    return (
      <div className="App">

        {this.props.children}
      </div>
    );
  }
}

const mapStateToProps = (props) => ({
  user: props.user,
});

const mapDispatchToProps = {
  initAccount
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
