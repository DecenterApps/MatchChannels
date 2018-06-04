import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getOpenChannels } from '../services/ethereumService';

class UserList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            users: []
        };
    }

    async componentDidMount() {
        const users = await getOpenChannels();

        console.log(users);

        this.setState({
            users
        });
    }

    render() {
        return (
            <div>
                <ul>
                {
                    this.state.users.map( u => 
                        <li key={u.args._webrtcId}> 
                            {u.args._webrtcId}
                        </li>
                    )
                }
                </ul>
            </div>
        )
    }

}

export default UserList;
