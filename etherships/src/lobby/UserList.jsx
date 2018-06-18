import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getOpenChannels } from '../services/ethereumService';
import { connectPlayer } from '../services/webrtcService';

import ChallengeModal from '../modals/ChallengeModal';

import { setConnection, pickFields } from '../actions/userActions';

import { checkMove } from '../actions/boardActions';

import { browserHistory } from 'react-router';

import { REFRESH_LOBBY_TIME } from '../constants/config';

import './UserList.css';

class UserList extends Component {

    constructor() {
        super();

        this.state = {
            modalIsOpen: false,
            users: [],
            username: "",
            amount: -1,
            channelId: -1,
            timer: null,
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    async componentDidMount() {
        const users = await getOpenChannels();

        // window.ethershipContract.JoinChannel({},{fromBlock: 0, toBlock: 'latest'}).watch((err, res) => {
        //     if (!err) {
        //         console.log(res);

        //         this.setState({
        //             users: [this.state.users, res]
        //         });
        //     }
        // });

        if (Object.keys(this.props.user.peer).length !== 0) {
            this.props.user.peer.on('connection', (_conn) => {
                this.props.setConnection(_conn);
        
                _conn.on('data', (res) => {
                    console.log(res);

                    if (res.type === 'challenge') {

                        this.setState({
                            username: res.username,
                            channelId: res.channelId,
                            amount: res.amount
                        });

                        this.openModal();
                    } else if(res.type === 'start_game') {
                        browserHistory.push('/match');
                    } else if(res.type === 'move') {
                        this.props.checkMove(res.pos);
                    } else if(res.type === 'move-resp') {
                        console.log('move resp', res.result);
                    }
                });
              });

            
        }

        this.setState({
            users
        });

    }

    challengeOpponent = (user) => {
        console.log(user);

        const connection = connectPlayer(this.props.user.peer, user.webrtcId);

        connection.on('open', () => {
            this.props.setConnection(connection);

            connection.send({
                type: 'challenge', 
                channelId: user.channelId.valueOf(), 
                username: this.props.user.userName,
                amount: user.amount.valueOf()
            });

            connection.on('data', (res) => {
                console.log(res);
                if (res.type === 'accepted') {
                    this.props.pickFields(res.channelId, res.amount);
                } else if(res.type === 'move') {
                    connection.send({type: 'move-resp', result: true});

                    this.props.checkMove(res.pos);
                } else if(res.type === 'move-resp') {
                    console.log('move resp', res.result);
                }
            });
        });
    }

    render() {
        return (
                <div>
                    <ChallengeModal 
                        modalIsOpen={ this.state.modalIsOpen } 
                        username={ this.state.username } 
                        channelId={ this.state.channelId }
                        amount={ this.state.amount }
                        closeModal={ this.closeModal }
                    />
                    <div className="user-list">
                        <div className="user-list-header">
                            choose opponent player
                        </div>

                        <div className="user-list-body">

                            {
                                this.state.users.map( u => 
                                    <div className="user-list-item" key={u.args.channelId.valueOf()}>
                                        <span className='user-list-id'>#{u.args.channelId.valueOf()}</span>
                                        <span className='user-list-name'> {u.args.username} </span>
                                        <button className='user-list-btn' onClick={() => this.challengeOpponent(u.args)}>Battle ({window.web3.fromWei(u.args.amount.valueOf(), 'ether')} ETH)</button>
                                    </div>)
                            }

                        </div>
                    </div>
                </div>
        )
    }

}

const mapStateToProps = (props) => ({
    user: props.user,
});

const mapDispatchToProps = {
    setConnection,
    pickFields,
    checkMove,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
