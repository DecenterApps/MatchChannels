import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router/lib';

import './PlayedMatches.css';

import { getUserChannels, getCurrentBlockNumber, timeout } from '../services/ethereumService';

class PlayedMatches extends Component {

  constructor(props) {
    super(props);

    this.state = {
      matches: [],
    };
  }

  async componentDidMount() {
    const openChannels = await getUserChannels('OpenChannel');
    const joinChannels = await getUserChannels('JoinChannel');

    const blockNum = await getCurrentBlockNumber();

    this.setState({
      matches: [...openChannels, ...joinChannels].sort((a, b) => a.channelId < b.channelId),
      blockNum,
    });

  }

  callTimeout = async (channelId) => {
    const res = await timeout(channelId);

    console.log(res);
  }

  renderMatchState(match) {
    if (match.finished) {
      return <span className='status red'>Closed</span>;
    } else {
      if (match.halfFinisher === "0x0000000000000000000000000000000000000000") {
        return <span className='status green'>Active</span>;
      } else {
        return <span className='status grey'>Half Closed</span>;
      }
    }
  }

  canBeTimeouted = (match) => {
    if (this.state.blockNum >= parseInt(match.blockStarted, 10) + 50 && !match.finished) {
      return true;
    } else {
      return false;
    }
    
  }

  goBack = () => {
    browserHistory.push('/');
  };

  render() {
  
    const { matches } = this.state;

    return (
      <div>
        <div>
         <button className="back-button back-btn-pos" onClick={this.goBack}>back</button>

          <div className="match-area">
            <div className="match-title">
              Your matches
            </div>

            

            <div className="match-header"> 
              <span>ID</span>
              <span>Opponent address</span>
              <span>Stake</span>
              <span>Status</span>
              <span>Score</span>
            </div>

            <div className="match-list">

              {
                matches.map(m =>
                  <div className="match-item" key={m.channelId}>
                    <span className='id'>#{m.channelId}</span>
                    <span className='opponent'> {m.p1} </span>
                    <span
                      className='stake'> ETH {window.web3.fromWei(m.stake, 'ether')} </span>

                     {this.renderMatchState(m)}

                     {
                      !this.canBeTimeouted(m) && 
                        <span className='score'>{m.p1Score} / {m.p2Score}</span>
                     }

                    {
                      this.canBeTimeouted(m) && 
                        <button className="btn-timeout" onClick={() => this.callTimeout(m.channelId)}>Close</button>
                    }


                  </div>)
              }

            </div>
          </div>
          <div className="left-ship" />
        <div className="right-ship" />
        </div>
      </div>
    );
  }

}

const mapStateToProps = (props) => ({
  user: props.user,
  board: props.board,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(PlayedMatches);
