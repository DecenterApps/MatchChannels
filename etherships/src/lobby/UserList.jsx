import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  setConnection,
  pickFields,
  connectToPlayer,
  addUsersToLobby,
} from '../actions/userActions';
import { openModal } from '../actions/modalActions';

import './UserList.css';

class UserList extends Component {
  componentDidMount() {
    this.props.addUsersToLobby();
  }

  render() {

    const { usersList } = this.props.user;

    return (
      <div>
        <div className="user-list">
          <div className="user-list-title">
            or choose opponent player
          </div>

          <div className="user-list-body">

            {
              usersList.length !== 0 && 
                <div className="user-list-header">
                  <div className="id-text">ID</div>
                  <div className="nickname-text">Nickname</div>
                  <div className="match-text">Match stake</div>
                </div>
            }

            {
              usersList.map(user =>
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
  openModal,
  connectToPlayer,
  addUsersToLobby,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
