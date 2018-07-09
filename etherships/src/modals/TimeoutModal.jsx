import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import { customModalStyles } from '../constants/config';

import './Modal.css';
import Timer from '../game/Timer';

import { submitScore } from '../actions/boardActions';

class TimeoutModal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            waiting: true,
        };
    }

    submitTimeout = () => {
        this.props.submitScore();
    }

    onTimerEnd = () => {
        console.log('timer callback');
        this.setState({
            waiting: false,
        });
    }

    render() {

        const { timeoutTimer } = this.props.board;

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

                            {
                                this.state.waiting && 
                                <Timer countdown={timeoutTimer} onTimerEnd={this.onTimerEnd}/>
                            }

                            {
                                !this.state.waiting && 
                                <button className="modal-create-btn" onClick={this.submitTimeout}>submit</button>

                            }

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
    submitScore,
};

export default connect(mapStateToProps, mapDispatchToProps)(TimeoutModal);