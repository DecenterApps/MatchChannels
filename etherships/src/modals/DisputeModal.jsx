import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import { customModalStyles } from '../constants/config';

import './Modal.css';

import { submitDispute } from '../actions/boardActions';

class DisputeModal extends Component {

    submitDispute = () => {
        console.log(this.props);
        console.log('modal data: ', this.props.modalData);
        const { channelId, sig, pos, seq, type, nonce, path } = this.props.modalData;

        console.log('Nonce: ', nonce);

        this.props.submitDispute(channelId, sig, pos, seq, type, nonce, path);
    }

    render() {

        return (
            <Modal
                isOpen
                onRequestClose={this.props.closeModal}
                contentLabel="User cheated"
                style={customModalStyles}>

                    <div className="modal-content end-game-content">
                            <div className="modal-small-title">
                                Opponent cheated!
                            </div>

                            <button className="modal-create-btn" onClick={this.submitDispute}>punish</button>

                            <div className="modal-warning-text">
                                We caught your opponent cheating you are now the winner 
                            </div>
                        </div>
            </Modal>
        );
    }

}

const mapStateToProps = (props) => ({
    user: props.user,
    board: props.board,
    modalData: props.modal.modalData,
});

const mapDispatchToProps = {
    submitDispute,
};

export default connect(mapStateToProps, mapDispatchToProps)(DisputeModal);