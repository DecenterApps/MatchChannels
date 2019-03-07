import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import { customModalStyles } from '../constants/config';

import './Modal.css';
import Timer from '../game/Timer';

import { submitScore, playAgain } from '../actions/boardActions';
import { browserHistory } from '../../node_modules/react-router/lib';

class TimeoutModal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            waiting: true,
        };
    }

    submitTimeout = async () => {
        await this.props.submitScore();

        browserHistory.push('/play');

        this.props.playAgain();
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
                                <Timer countdown={timeoutTimer} onTimerEnd={this.onTimerEnd} type='timeout' />
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
    playAgain,
};

export default connect(mapStateToProps, mapDispatchToProps)(TimeoutModal);