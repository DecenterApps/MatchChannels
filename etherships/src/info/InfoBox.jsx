import React, { Component } from 'react';
import { connect } from 'react-redux';

import './InfoBox.css';

class InfoBox extends Component {

  constructor(props) {
    super(props);

    this.state = {
      shown: true,
    };
  }
  render() {
    const user = this.props.user;
    const board = this.props.board;
    return (
      <div className="infobox-wrapper">
        {
          this.state.shown &&
          <div className="infobox-inner">
            <div>User Address: { user.userAddr }</div>
            <div>User Signing Address: { user.userWallet.address }</div>
            <div>Peer ID: { user.peer.id }</div>
            <hr />
            <div>Opponent Address: { user.opponentAddr }</div>
            {
              user.peer.connections &&
              <div>
                Connections:
                {
                  Object.keys(user.peer.connections).map(peerId => {
                    const peerConns = user.peer.connections[peerId];
                    return peerConns.map((conn, index) =>
                      <div key={`${peerId}-${index}`}>
                        - {conn.peer} ({conn.open ? 'open' : 'closed'})
                      </div>
                    )
                  })
                }
              </div>
            }
            <hr />
            <div>Game bet ammount: { user.gameBetAmount }</div>
            <div>Own points: { board.boardGuesses.filter(p => p === 3).length } / { board.boardGuesses.filter(p => p !== 0).length }</div>
            <div>Opponent points: { board.board.filter(p => p === 3).length } / { board.board.filter(p => p !== 0).length }</div>
          </div>
        }
        <span onClick={() => this.setState({ shown: !this.state.shown })}>toggle info</span>
      </div>
    );
  }

}

const mapStateToProps = (props) => ({
  user: props.user,
  board: props.board,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(InfoBox);
