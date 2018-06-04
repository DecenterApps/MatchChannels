
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setName, editName } from '../actions/userActions';

import './UserList';
import UserList from './UserList';

class Lobby extends Component {

    constructor(props) {
        super(props);


    }

    render() {

        const { userNameEdit, usersList } = this.props.user;
        const { setName, editName } = this.props;

        const { onContract } = this.props.board;

        console.log(this.props.board);

        return (
            <div>
                {
                    !onContract && 
                    <div>
                        <button onClick={ setName }> Start Game </button>
                        <input type="text" onChange={editName} value={userNameEdit} />
                    </div>
                }

                {
                    onContract && 
                    <h4>Waiting for your opponent...</h4>
                }

              <div>
              {
                    onContract && 
                    <UserList />
                }
              </div>
            </div>
        );
    }x
}

const mapStateToProps = (props) => ({
    user: props.user,
    board: props.board
});

const mapDispatchToProps = {
    setName,
    editName,
};

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);