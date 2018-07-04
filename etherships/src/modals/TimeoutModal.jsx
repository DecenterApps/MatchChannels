import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import { customModalStyles } from '../constants/config';

import './Modal.css';

class TimeoutModal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            waiting: false,
        };
    }

    submitTimeout = () => {

    }

    render() {

        return (
            <Modal
                isOpen
                onRequestClose={this.props.closeModal}
                contentLabel="User disconnected"
                style={customModalStyles}>

                    <div className="modal-content end-game-content">
                            <div className="modal-small-title">
                                Opponent disconnected
                            </div>

                            <button className="modal-create-btn" onClick={this.submitTimeout}>submit</button>

                            <div className="modal-warning-text">
                                Your opponent has disconnected 
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
};

export default connect(mapStateToProps, mapDispatchToProps)(TimeoutModal);