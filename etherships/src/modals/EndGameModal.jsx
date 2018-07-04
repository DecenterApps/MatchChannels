import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import { customModalStyles } from '../constants/config';

import { submitScore } from '../actions/boardActions';

import './Modal.css';

class EndGameModal extends Component {

    constructor(props) {
        super(props);
    
        this.state = {
          waiting: false,
        };
      }

    submit = async () => {
        this.props.submitScore();

        this.setState({ waiting: true });
    }

    render() {

        const numHits = this.props.board.board.filter(b => b === 3).length;
        const numOpponentHits = this.props.board.opponentsBoard.filter(b => b === 3).length;

        return (
            <Modal
                isOpen
                onRequestClose={this.props.closeModal}
                contentLabel="Game Finished"
                style={customModalStyles}>

                    <div className="modal-content end-game-content">
                            <div className="modal-small-title">
                                game finished
                            </div>

                            <div className="modal-title end-game-title">
                                score
                            </div>

                            <div className="big-label">
                                {numHits} - {numOpponentHits}
                            </div>

                            {
                                this.state.waiting &&
                                        <div className="lds-ring">
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        </div>
                            }

                            { !this.state.waiting &&
                                <button className="modal-create-btn" onClick={this.submit}>submit</button>
                            }

                            <div className="modal-warning-text">
                                You must submit the score to close the channel!
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

export default connect(mapStateToProps, mapDispatchToProps)(EndGameModal);