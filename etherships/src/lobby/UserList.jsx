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
            <div className='container'>
                <div className='title'>
                    battleship
                </div>

                <div className="user-list">
                    <div className="user-list-header">
                        choose opponent player
                    </div>

                    <div className="user-list-body">

                        <div className="user-list-item">
                            <span className='user-list-name'> Name sdfdsfds </span>
                            <button className='user-list-btn'>Battle </button>
                        </div>

                        <div className="user-list-item">
                            <span className='user-list-name'> Name sdfdsfds </span>
                            <button className='user-list-btn'>Battle </button>
                        </div>

                        <div className="user-list-item">
                            <span className='user-list-name'> Name sdfdsfds </span>
                            <button className='user-list-btn'>Battle </button>
                        </div>

                        <div className="user-list-item">
                            <span className='user-list-name'> Name sdfdsfds </span>
                            <button className='user-list-btn'>Battle </button>
                        </div>

                        <div className="user-list-item">
                            <span className='user-list-name'> Name sdfdsfds </span>
                            <button className='user-list-btn'>Battle </button>
                        </div>

                        <div className="user-list-item">
                            <span className='user-list-name'> Name sdfdsfds </span>
                            <button className='user-list-btn'>Battle </button>
                        </div>

                        <div className="user-list-item">
                            <span className='user-list-name'> Name sdfdsfds </span>
                            <button className='user-list-btn'>Battle </button>
                        </div>

                        <div className="user-list-item">
                            <span className='user-list-name'> Name sdfdsfds </span>
                            <button className='user-list-btn'>Battle </button>
                        </div>

                        <div className="user-list-item">
                            <span className='user-list-name'> Name sdfdsfds </span>
                            <button className='user-list-btn'>Battle </button>
                        </div>

                        <div className="user-list-item">
                            <span className='user-list-name'> Name sdfdsfds </span>
                            <button className='user-list-btn'>Battle </button>
                        </div>

                        <div className="user-list-item">
                            <span className='user-list-name'> Name sdfdsfds </span>
                            <button className='user-list-btn'>Battle </button>
                        </div>

                        <div className="user-list-item">
                            <span className='user-list-name'> Name sdfdsfds </span>
                            <button className='user-list-btn'>Battle </button>
                        </div>

                        <div className="user-list-item">
                            <span className='user-list-name'> Name sdfdsfds </span>
                            <button className='user-list-btn'>Battle </button>
                        </div>

                        <div className="user-list-item">
                            <span className='user-list-name'> Name sdfdsfds </span>
                            <button className='user-list-btn'>Battle </button>
                        </div>

                    </div>
                </div>

                {/* <div>
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
                </div> */}
            </div>
        )
    }

}

export default UserList;
