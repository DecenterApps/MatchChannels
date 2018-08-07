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
      ethAmount: '',
      isError: false,
    };
  }

  componentWillMount() {
    if (!this.props.user.registered) browserHistory.push('/');
  }

  async componentDidMount() {
    // setInterval(async () => {
    //   const currBlockNum = await getCurrentBlockNumber();
      
    //   if ((parseInt(currBlockNum, 10) > parseInt(this.props.board.blockNumber, 10) + NUM_BLOCKS_FOR_CHANNEL) && localStorage.getItem('board')) {
    //     localStorage.removeItem('user');
    //     localStorage.removeItem('board');
    //     window.location.reload();
    //   }
    // }, 3000);
  }

  handleChange = (event) => {
    const value = event.target.value;

    if (!this.isNumber(value) && value !== '') {
      this.setState({
        isError: true,
     });
    } else {
      this.setState({
         ethAmount: value,
         isError: false,
      });
    }
  };

  createNewGame = () => {
    if (this.state.ethAmount === '') {
      this.setState({ isError: true });
    } else {
      this.props.newGame(this.state.ethAmount);
    }
  };

  gotoProfile = () => {
    browserHistory.push('/profile');
  };

  gotoMatches = () => {
    browserHistory.push('/history');
  };

  isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  render() {
    const { hasCreatedMatch } = this.props.user;

    const { isError, ethAmount } = this.state;

    let inputStyle = isError ? 'user-list-input warning-input' : 'user-list-input';
    let placeholderText = isError ? 'Enter a number' : 'Match Stake (in ETH)';

    return (
      <div>
        <div className="lobby-header">
          <button className='btn-matches' onClick={this.gotoMatches}>Matches</button>
          <div className='logo' />
          <button className='btn-profile' onClick={this.gotoProfile}>Profile</button>
        </div>

        <div className='lobby-container'>
          {
            !hasCreatedMatch && 
              <div className='lobby-list'>
                <div className="user-list-item">
                  <input className={inputStyle} value={ethAmount} onChange={this.handleChange} type="text" placeholder={placeholderText} />
              
                  {
                    ethAmount === "" && 
                    <button className='user-list-btn-grey' onClick={this.createNewGame}>Create Game</button>
                  }

                  {
                    ethAmount !== "" && 
                    <button className='user-list-btn' onClick={this.createNewGame}>Create Game</button>
                  }

                </div>

                <UserList />

            </div>
          }

          {
            hasCreatedMatch && 
              <div className="user-list-title waiting-text">
                waiting for your opponent to connect...

                <div className="lds-ring loader-margin"><div></div><div></div><div></div><div></div></div>
              </div>
          }
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