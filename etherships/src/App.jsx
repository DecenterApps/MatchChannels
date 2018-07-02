import React, { Component } from 'react';
import { connect } from 'react-redux';
import { initAccount } from './actions/userActions';
import { initBoard } from './actions/boardActions';
import ChallengeModal from './modals/ChallengeModal';
import InfoBox from './info/InfoBox';
import EndGameModal from './modals/EndGameModal';

// Styles
import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

class App extends Component {

  componentDidMount() {
    if (this.props.user.userAddr) {
      this.props.initAccount();
      this.props.initBoard();
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
        <InfoBox />
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
