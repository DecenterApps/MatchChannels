import React, { Component } from 'react';
import { connect } from 'react-redux';

import './UserList';
import UserList from './UserList';
import CreateGameModal from '../modals/CreateGameModal';
import { browserHistory } from 'react-router/lib';

class Lobby extends Component {

    constructor() {
        super();

        this.state = {
            modalIsOpen: false
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

    gotoProfile = () => {
        browserHistory.push('/profile');
    }

    render() {

        const { userName } = this.props.user;

        return (
            <div>
                <div className="lobby-header">
                    <div className='logo'>
                        
                    </div>

                    <button className='btn-profile' onClick={this.gotoProfile}>Profile</button>
                </div>

                <div className='lobby-container'>
                    <div className="left-ship"></div>

                    <div className='lobby-list'>
                        <div className="user-list-item">
                            <span className='user-list-name'> { userName } </span>
                            <button className='user-list-btn' onClick={this.openModal}>Create Game</button>
                        </div>

                        <CreateGameModal modalIsOpen={ this.state.modalIsOpen } closeModal={ this.closeModal }/>

                        <UserList />

                    </div>

                    <div className="right-ship"> </div>
                </div>
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