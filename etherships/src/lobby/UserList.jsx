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
  async componentDidMount() {
    this.props.addUsersToLobby();
  }

  render() {

    const { usersList, userAddr } = this.props.user;

    return (
      <div>
        <div className="user-list">
          <div className="user-list-header">
            or choose opponent player
          </div>

          <div className="user-list-body">

            {
              usersList.map(user =>
                <div className="user-list-item" key={user.args.channelId.valueOf()}>
                  <span className='user-list-id'>#{user.args.channelId.valueOf()}</span>
                  <span className='user-list-name'> {user.args.username} </span>
                  <span
                    className='user-list-value'> ETH {window.web3.fromWei(user.args.amount.valueOf(), 'ether')} </span>

                  {
                    user.args.addr !== userAddr && 
                    <button className='user-list-btn'
                          onClick={() => this.props.connectToPlayer(user.args)}>Battle
                  </button>
                  }

                  {
                    user.args.addr === userAddr && 
                    <button className='user-list-btn grey-btn waiting-btn'>
                      <div className="lds-ring-small">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    </button>
                  }

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
