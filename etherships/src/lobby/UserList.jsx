import React, { Component } from 'react';
import { connect } from 'react-redux';

import { connectPlayer } from '../services/webrtcService';

import ChallengeModal from '../modals/ChallengeModal';

import { setConnection, pickFields, setOpponentAddr, addUsersToLobby } from '../actions/userActions';

import { checkMove, checkMoveResponse } from '../actions/boardActions';

import { browserHistory } from 'react-router';

import './UserList.css';

class UserList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modalIsOpen: false,
            username: "",
            amount: -1, 
            channelId: -1,
            timer: null,
            addr: "",
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
        this.props.addUsersToLobby();

        if (Object.keys(this.props.user.peer).length !== 0) {
            this.props.user.peer.on('connection', (_conn) => {
                this.props.setConnection(_conn);
        
                _conn.on('data', (res) => {
                    this.msgReceived(_conn, res);
                });
            });
        }

    }

    challengeOpponent(user) {
        const connection = connectPlayer(this.props.user.peer, user.webrtcId);

        connection.on('open', () => {
            this.props.setConnection(connection, user.webrtcId, user.channelId.valueOf());

            // send the challenge to the opponent
            connection.send({
                type: 'challenge',
                channelId: user.channelId.valueOf(),
                username: this.props.user.userName,
                amount: user.amount.valueOf(),
                addr: this.props.user.userAddr,
            });

            connection.on('data', (message) => {
                this.msgReceived(connection, message);
            });
        });
    }

    msgReceived(connection, message) { // TODO Move to userActions
        switch(message.type) {
            case 'accepted':
                this.props.pickFields(message.channelId, message.amount, message.addr);
            break;

            case 'challenge':
                this.setDataAndOpenModal(message);
            break;

            case 'start_game':
                browserHistory.push('/match');
            break;

            case 'move':
                connection.send({type: 'move-resp', result: true});
                this.props.checkMove(message.pos);
            break;

            case 'move-resp':
                this.props.checkMoveResponse(message);
            break;

            default:
                console.log(message);
        }
    }

    setDataAndOpenModal(res) {
        this.setState({
            username: res.username,
            channelId: res.channelId,
            amount: res.amount,
            addr: res.addr,
        });

        this.openModal();

        this.props.setOpponentAddr(res.addr, res.channelId);
    }

    render() {

        const { usersList } = this.props.user;

        return (
                <div>
                    <ChallengeModal 
                        modalIsOpen={ this.state.modalIsOpen } 
                        username={ this.state.username } 
                        channelId={ this.state.channelId }
                        amount={ this.state.amount }
                        addr={ this.state.addr }
                        closeModal={ this.closeModal }
                    />
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
                                        <span className='user-list-value'> ETH {window.web3.fromWei(user.args.amount.valueOf(), 'ether')} </span>
                                        <button className='user-list-btn' onClick={() => this.challengeOpponent(user.args)}>Battle</button>
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
    checkMoveResponse,
    setOpponentAddr,
    addUsersToLobby,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
