import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import { connect } from 'react-redux';

import './Profile.css';

import { hasOngoingMatch } from '../services/ethereumService';
import { fundAccount, withdrawFunds } from '../actions/userActions';

class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
          fundValue: 0,
          withdrawValue: 0,
          numWins: 0,
          numLosses: 0,
        };
    }

    async componentDidMount() {
      const res = await hasOngoingMatch();

      this.setState({
        numWins: res.numWins,
        numLosses: res.numLosses,
      });
    }

    fundAccount = () => {
        this.props.fundAccount(this.state.fundValue);
        this.setState({fundValue: 0})
    };

    handleFundChange = (event) => {
        this.setState({ fundValue: event.target.value});
    };

    withdrawFunds = () => {
    	this.props.withdrawFunds(this.state.withdrawValue);
        this.setState({withdrawValue: 0})
	};

    handleWithdrawChange = (event) => {
        this.setState({ withdrawValue: event.target.value});
    };

    handleClick = () => {
        browserHistory.push("users");
    }

    render() {
      const { fundValue, withdrawValue, numWins, numLosses } = this.state;

        return (
          <div>
        	<div className='container'>
            <div>
              <button className="back-button" onClick={this.handleClick}>back</button>
              <div className='logo' />
              <br />
              <div className='small-titles'>
                profile
              </div>
              <div className='big-label'>
                {
                  this.props.user.username
                }
              </div>
              <div className='small-titles'>
                balance
              </div>
              <div className='big-label'>
                {
                  this.props.user.balance
                } (ETH)
              </div>
              <div className="div-flex">
                <div className="wrapper">
                  <div id="inner1">
                    <input className="name-input profile-input" type="text" onChange={this.handleFundChange}
                           value={fundValue} />
                  </div>
                  <div id="inner2">
                    <button className='btn' onClick={this.fundAccount}>Deposit</button>
                  </div>
                </div>

                <div className="wrapper">
                  <div id="inner1">
                    <input className="name-input profile-input" type="text" onChange={this.handleWithdrawChange}
                           value={withdrawValue} />
                  </div>
                  <div id="inner2">
                    <button className='btn' onClick={this.withdrawFunds}>Withdraw</button>
                  </div>
                </div>
              </div>

              <div className="small-titles">
                games
              </div>
              <div className="big-label">
                <span className='inner-text'> win </span> {numWins}/{numLosses} <span className='inner-text'>lose </span>
              </div>

              <div className="big-label">
                {this.props.user.gamesPlayed}
              </div>

              <div className='games-finished'> games finished </div>
              <div className='games-left'> games left {this.props.user.gamesPlayed - this.props.user.finishedGames} </div>

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
});
  
const mapDispatchToProps = {
	fundAccount,
	withdrawFunds
};
  
export default connect(mapStateToProps, mapDispatchToProps)(Profile);


