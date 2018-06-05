import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getOpenChannels } from '../services/ethereumService';

import './UserList.css';

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
                        <li key={u.args._webrtcId} className='userItem'> 
                            {u.args._webrtcId}

                            <button className='battleBtn'> Battle </button>
                        </li>
                    )
                }
                </ul>
            </div>
        )
    }

}

export default UserList;
