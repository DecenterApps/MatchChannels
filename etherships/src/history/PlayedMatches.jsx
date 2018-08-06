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
      matches: [...openChannels, ...joinChannels].sort((a, b) => parseInt(b.channelId, 10) - parseInt(a.channelId, 10)),
      blockNum,
    });

  }

  callTimeout = async (channelId) => {
    const res = await timeout(channelId);

    console.log(res);
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
    browserHistory.push('/');
  };

  render() {
  
    const { matches } = this.state;

    return (
      <div>
        {/* <div className="left-ship" />
        <div className="right-ship" /> */}

        <div>
         <button className="back-button back-btn-pos" onClick={this.goBack}>back</button>

          <div className="match-area">
            <div className="match-title">
              Your matches
            </div>

            
            <table>
              <thead>
                <tr className="match-header"> 
                  <th>ID</th>
                  <th>Opponent address</th>
                  <th>Stake</th>
                  <th>Status</th>
                  <th>Score</th>
                </tr>
              </thead>

              <tbody>
                {
                  matches.map(m =>
                    <tr className="match-item" key={m.channelId}>
                      <td className='id'>#{m.channelId}</td>
                      <td className='opponent'> {m.p1} </td>
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


                    </tr>)
                }
                </tbody>
              </table>
          </div>
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
