import React, { Component } from 'react';
import { connect } from 'react-redux';
import { initAccount } from './actions/userActions';
import { initBoard } from './actions/boardActions';
import ChallengeModal from './modals/ChallengeModal'

// Styles
import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

class App extends Component {

  componentDidMount() {
    this.props.initAccount();
    this.props.initBoard();
  }

  render() {
    return (
      <div className="App">
        {this.props.children}
        {
          this.props.modalShown === 'challenge' &&
          <ChallengeModal />
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  modalShown: state.modal.modalShown,
});

const mapDispatchToProps = {
  initAccount,
  initBoard,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
