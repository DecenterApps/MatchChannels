import React, { Component } from 'react';
import { connect } from 'react-redux';

import './UserList';
import UserList from './UserList';

class Lobby extends Component {
    render() {

        return (
            <div>
                <UserList />
            </div>
        );
    }
}

const mapStateToProps = (props) => ({
    user: props.user,
    board: props.board
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);