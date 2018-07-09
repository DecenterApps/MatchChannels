import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import { customModalStyles } from '../constants/config';

import './Modal.css';

import { submitDispute } from '../actions/boardActions';

class DisputeModal extends Component {

    submitDispute = () => {
        this.props.submitDispute();
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

                            <button className="modal-create-btn" onClick={this.submitTimeout}>punish</button>

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
});

const mapDispatchToProps = {
    submitDispute,
};

export default connect(mapStateToProps, mapDispatchToProps)(DisputeModal);