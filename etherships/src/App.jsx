import React, { Component } from 'react';
import { connect } from 'react-redux';
import { initAccount } from './actions/userActions';
import { initBoard } from './actions/boardActions';
import ChallengeModal from './modals/ChallengeModal';
import ConnectionModal from './modals/ConnectionModal';
import EndGameModal from './modals/EndGameModal';
import TimeoutModal from './modals/TimeoutModal';

// Styles
import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';
import DisputeModal from './modals/DisputeModal';

import { browserHistory } from 'react-router';

class App extends Component {

  componentDidMount() {
    if (this.props.user.userAddr) {
      this.props.initAccount();
      this.props.initBoard();
    }

    const board = localStorage.getItem("board");

    if (board && JSON.parse(board).gameInProgress) {
      browserHistory.push('/match');
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.user.userAddr && this.props.user.userAddr) {
      this.props.initAccount();
      this.props.initBoard();
    }
  }

  render() {
    return (
      <div className="App">
        {
          this.props.user.userAddr &&
          this.props.children
        }
        {
          this.props.user.userError &&
          <div className="user-error">{ this.props.user.userError }</div>
        }
        {
          this.props.modalShown === 'challenge' &&
          <ChallengeModal />
        }

        {
          this.props.modalShown === 'endgame' &&
          <EndGameModal />
        }

        {
          this.props.modalShown === 'timeout' &&
          <TimeoutModal />
        }

        {
          this.props.modalShown === 'dispute' &&
          <DisputeModal />
        }

        {
          this.props.modalShown === 'connection' &&
          <ConnectionModal />
        }

        {/* <InfoBox /> */}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  board: state.board,
  modalShown: state.modal.modalShown,
});

const mapDispatchToProps = {
  initAccount,
  initBoard,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
