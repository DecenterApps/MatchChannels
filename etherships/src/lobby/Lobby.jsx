
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setName, editName } from '../actions/userActions';


class Lobby extends Component {

    render() {

        const { userNameEdit, usersList } = this.props.user;
        const { setName, editName } = this.props;

        return (
            <div>
              <div>
                <button onClick={ setName }> Start Game </button>
                <input type="text" onChange={editName} value={userNameEdit} />
              </div>

              <div>
                <h4>User list</h4>
                {
                    usersList.map(user => 
                        <li> {user.name} </li>
                    )
                }
              </div>
            </div>
        );
    }x
}

const mapStateToProps = (props) => ({
    user: props.user
});

const mapDispatchToProps = {
    setName,
    editName,
};

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);