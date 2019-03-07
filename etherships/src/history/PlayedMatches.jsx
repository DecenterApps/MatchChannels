import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router/lib';

import './PlayedMatches.css';

import { getUserChannels, getCurrentBlockNumber, timeout, getNickname } from '../services/ethereumService';

class PlayedMatches extends Component {

  constructor(props) {
    super(props);

    this.state = {
      matches: [],
      names: [],
      hasMatches: true,
    };
  }

  async componentDidMount() {
    const openChannels = await getUserChannels('OpenChannel');
    const joinChannels = await getUserChannels('JoinChannel');

    const blockNum = await getCurrentBlockNumber();

    if ([...openChannels, ...joinChannels].length === 0) {
      this.setState({ hasMatches: false });
    }

    const sortedMatches = [...openChannels, ...joinChannels].sort((a, b) => parseInt(b.channelId, 10) - parseInt(a.channelId, 10));

    const currUser = this.props.user.userAddr;

    sortedMatches.map(m => {
      const userScore = m.p1 === currUser ? m.p1Score : m.p2Score;
      const opponentScore = m.p1 === currUser ? m.p2Score : m.p1Score;
      const stake = window.web3.fromWei(m.stake, 'ether');

      if (userScore === '5') {
        m.result = <td className='status green'>Won ({parseFloat(((stake / 5) * (userScore - opponentScore)).toFixed(4))} eth)</td>;
      } else if (opponentScore === '5') {
        m.result = <td className='status red'>Lost ({parseFloat(((stake / 5) * (opponentScore - userScore)).toFixed(4))} eth)</td>;
      } else {
        m.result = <td className='status grey'>Pending</td>;
      }
      
    });

    const namesPromises = sortedMatches.map(m => getNickname(m.p1 === currUser ? m.p2 : m.p1));

    const names = await Promise.all(namesPromises);

    this.setState({
      matches: sortedMatches,
      blockNum,
      names,
    });

  }

  callTimeout = async (channelId) => {
    await timeout(channelId);

    localStorage.removeItem('board');
    localStorage.removeItem('user');

    window.location.reload();
  }

  renderMatchState(match) {
    if (match.finished) {
      return <td className='status red'>Closed</td>;
    } else {
      if (match.halfFinisher === "0x0000000000000000000000000000000000000000") {
        return <td className='status green'>Active</td>;
      } else {
        return <td className='status grey'>Half Closed</td>;
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
    browserHistory.push('/play');
  };

  render() {
  
    const { matches, hasMatches } = this.state;

    return (
      <div>
        <div>

         <div className="match-area">
         <button className="back-button back-btn-pos" onClick={this.goBack}>back</button>
            <div className="match-title">
              Your matches
            </div>

          {
            matches.length !== 0 &&  
            <table>
              <thead>
                <tr className="match-header"> 
                  <th>ID</th>
                  <th>Opponent</th>
                  <th>Stake</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Result</th>
                </tr>
              </thead>

              <tbody>
                {
                  matches.map((m, i) =>
                    <tr className="match-item" key={m.channelId}>
                      <td className='id'>#{m.channelId}</td>
                      <td className='opponent'> { this.state.names[i] || '' } </td>
                      <td
                        className='stake'> ETH {window.web3.fromWei(m.stake, 'ether')} </td>

                      {this.renderMatchState(m)}

                      {
                        !this.canBeTimeouted(m) && 
                          <td className='score'>{m.p1Score} / {m.p2Score}</td>
                      }

                      {
                        this.canBeTimeouted(m) && 
                          <td><button className="btn-timeout" onClick={() => this.callTimeout(m.channelId)}>Close</button></td>
                      }

                      {m.result}


                    </tr>)
                }
                </tbody>
              </table>
          }

          {
            !hasMatches &&  
            <div className="small-titles">You don't have any played matches.</div>
          }

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
