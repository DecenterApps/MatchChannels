import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import { connect } from 'react-redux';

import './Landing.css';

import field from '../images/field.png';
import logo from '../images/logo.png';

class Landing extends Component {
  constructor(props) {
    super(props);
  }

  redirect() {
    browserHistory.push('/play');
  }

  render() {

    return (
      <main>
        <div>
          <div className="landing-content">
            <div className="content-wrapper">
              <div className="landing-left-content">
                <img className="landing-logo" src={logo} alt="" />
                <div className="landing-title">
                  The classic guessing game - <br />now on the Ethereum blockchain.
                </div>
                <div className="landing-text">
                  <br /><br />
                  Etherships is a 1v1 peer-to-peer game based on the classic guessing game
                  Battleships that runs on the Ethereum blockchain. It utilizes state channels to
                  minimize the number of required interactions with the blockchain and to provide a
                  seemingless, uninterrupted gameplay experience to users. You can read the <a
                  href="https://blog.decenter.com/2018/08/07/introducing-etherships-using-state-channels-scale-ethereum-games/"
                  target="_blank">blog
                  post</a> we wrote about it if you’re interested in the techy details.
                  <br /><br />
                  The game is currently running on the Kovan test network, so you’ll need to switch
                  MetaMask to it in order to play. If you need Kovan ETH, you can get some from <a
                  href="https://faucet.selenean.com/" target="_blank">our faucet here.</a>
                </div>

                <div className="button-group">
                  <button className="btn" onClick={this.redirect}>Play game</button>
                  <a href="https://github.com/DecenterApps/MatchChannels" target="_blank">
                    <button className="btn gray">Github</button>
                  </a>
                </div>
                <div className="landing-text link-area">
                  Developed by <a href="https://decenter.com/" target="_blank">Decenter</a>
                </div>
              </div>
              <div className="landing-right-content">
                <img src={field} alt="Etherships field" />
              </div>
            </div>
          </div>
          <div className="left-ship" />
          <div className="right-ship" />
        </div>
      </main>
    );
  }

}

export default Landing;


