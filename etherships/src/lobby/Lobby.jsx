import React, { Component } from 'react';
import { connect } from 'react-redux';

import './UserList';
import UserList from './UserList';
import { browserHistory } from 'react-router/lib';

import { newGame } from '../actions/userActions';

class Lobby extends Component {

  constructor(props) {
    super(props);

    this.state = {
      ethAmount: 0
    };
  }

  componentWillMount() {
    if (!this.props.user.registered) browserHistory.push('/');
  }

  handleChange = (event) => {
    this.setState({ ethAmount: event.target.value });
  };

  createNewGame = () => {
    this.props.newGame(this.state.ethAmount);
  };

  gotoProfile = () => {
    browserHistory.push('/profile');
  };

  render() {
    const { hasCreatedMatch } = this.props.user;

    return (
      <div>
        <div className="lobby-header">
          <div className='logo' />
          <button className='btn-profile' onClick={this.gotoProfile}>Profile</button>
        </div>

        <div className='lobby-container'>
          <div className='lobby-list'>
            <div className="user-list-item">
              <input className='user-list-input' value={this.state.ethAmount} onChange={this.handleChange} type="text" placeholder="Amount" />
              {
                !hasCreatedMatch && 
                <button className='user-list-btn' onClick={this.createNewGame}>Create Game</button>

              }

              {
                hasCreatedMatch && 
                <button className='user-list-btn grey-btn'>created</button>
              }
            </div>

            <UserList />

          </div>

        </div>

        <div className="left-ship" />
        <div className="right-ship" />
      </div>
    );
  }
}

const mapStateToProps = (props) => ({
  user: props.user,
  board: props.board
});

const mapDispatchToProps = {
  newGame,
};

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);