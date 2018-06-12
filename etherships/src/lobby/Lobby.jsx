import React, { Component } from 'react';
import { connect } from 'react-redux';

import './UserList';
import UserList from './UserList';
import CreateGameModal from '../modals/CreateGameModal';

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

    render() {

        const { userName } = this.props.user;

        return (
            <div className='container'>
                <div className='title'>
                    battleship
                </div>
                <div className="user-list-item">
                    <span className='user-list-name'> { userName } </span>
                    <button className='user-list-btn' onClick={this.openModal}>Create Game</button>
                </div>

                <CreateGameModal modalIsOpen={ this.state.modalIsOpen } closeModal={ this.closeModal }/>

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