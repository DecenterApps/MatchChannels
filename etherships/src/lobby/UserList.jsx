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
                <div className="user-list">
                    <div className="user-list-header">
                        choose opponent player
                    </div>

                    <div className="user-list-body">

                        {
                            this.state.users.map( u => 
                                <div className="user-list-item" key={u.args.webrtcId}>
                                    <span className='user-list-id'>#{u.args.channelId.valueOf()}</span>
                                    <span className='user-list-name'> {u.args.username} </span>
                                    <button className='user-list-btn'>Battle ({window.web3.fromWei(u.args.amount.valueOf(), 'ether')} ETH)</button>
                                </div>)
                        }

                    </div>
                </div>
        )
    }

}

export default UserList;
