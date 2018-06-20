import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import { customModalStyles } from '../constants/config';

import { submitScore } from '../actions/boardActions';

import './Modal.css';

class EndGameModal extends Component {

    submit = () => {
        this.props.submitScore();
    }

    render() {

        const numHits = this.props.board.board.filter(b => b === 3).length;
        const numOpponentHits = this.props.board.boardGuesses.filter(b => b === 3).length;

        return (
            <Modal
                isOpen={this.props.modalIsOpen}
                onRequestClose={this.props.closeModal}
                contentLabel="Game Finished"
                style={customModalStyles}>

                    <div className="modal-content">
                        <div className="modal-title">
                            game finished
                        </div>

                        <div className="modal-title">
                            score
                        </div>

                        <div className="big-label">
                            {numHits} - {numOpponentHits}
                        </div>

                        <button className="modal-create-btn" onClick={this.submit}>submit</button>

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

export default connect(mapStateToProps, mapDispatchToProps)(EndGameModal);