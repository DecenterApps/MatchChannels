import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import { newGame } from '../actions/userActions';

import './Modal.css';

import { customModalStyles } from '../constants/config';


class ChallengeModal extends Component {

    clicked = () => {
        this.props.user.connection.send({type:'accepted', channelId: this.props.channelId, amount: this.props.amount});

        this.props.closeModal();
    }

    render() {

        return (
            <Modal
                    isOpen={this.props.modalIsOpen}
                    onRequestClose={this.props.closeModal}
                    contentLabel="Challenge"
                    style={customModalStyles}
                >

                    <div className="modal-content">
                        <div className="modal-title">
                            You were challenged by { this.props.username }
                        </div>

                        <button className="modal-create-btn" onClick={this.clicked}>Accept</button>

                    </div>
                  
                    </Modal>
        );
    }

}

const mapStateToProps = (props) => ({
    user: props.user,
});

const mapDispatchToProps = {
    newGame
};

export default connect(mapStateToProps, mapDispatchToProps)(ChallengeModal);