import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getActiveChannels } from '../services/ethereumService';

import {
  setConnection,
  pickFields,
  setOpponentAddr,
  connectToPlayer,
  addUsersToLobby,
} from '../actions/userActions';
import { checkMove, checkMoveResponse } from '../actions/boardActions';
import { openModal } from '../actions/modalActions';

import './UserList.css';

class UserList extends Component {

  constructor(props) {
    super(props);

    this.state = {
      users: [],
      username: '',
      amount: -1,
      channelId: -1,
      timer: null,
      addr: '',
    };
  }

  async componentDidMount() {
    const users = await getActiveChannels();
    this.props.addUsersToLobby();

    this.setState({
      users
    });
  }

  render() {
    return (
      <div>
        <div className="user-list">
          <div className="user-list-header">
            or choose opponent player
          </div>

          <div className="user-list-body">

            {
              this.state.users.map(user =>
                <div className="user-list-item" key={user.args.channelId.valueOf()}>
                  <span className='user-list-id'>#{user.args.channelId.valueOf()}</span>
                  <span className='user-list-name'> {user.args.username} </span>
                  <span
                    className='user-list-value'> ETH {window.web3.fromWei(user.args.amount.valueOf(), 'ether')} </span>
                  <button className='user-list-btn'
                          onClick={() => this.props.connectToPlayer(user.args)}>Battle
                  </button>
                </div>)
            }

          </div>
        </div>
      </div>
    );
  }

}

const mapStateToProps = (props) => ({
  user: props.user,
});

const mapDispatchToProps = {
  setConnection,
  pickFields,
  checkMove,
  checkMoveResponse,
  setOpponentAddr,
  openModal,
  connectToPlayer,
  addUsersToLobby,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
