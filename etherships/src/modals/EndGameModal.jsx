import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import { customModalStyles } from '../constants/config';
import { submitScore, playAgain } from '../actions/boardActions';

import { getChannelInfo } from '../services/ethereumService';

import './Modal.css';
import { setInterval } from 'timers';

class EndGameModal extends Component {

    constructor(props) {
        super(props);
    
        this.state = {
          stage: 'start',
          timerId: null,
        };
    }

    async componentDidMount() {
        const { opponentChannel } = this.props.user;

        console.log('opponentChannel: ', opponentChannel);

        const timer = setInterval(async () => {
            const channel = await getChannelInfo(opponentChannel);

            console.log('Channel finished: ', channel.finished);

            if (channel.finished) {
                this.setState({
                    stage: 'finish'
                });
            }

        }, 3000);

        this.setState({
            timerId: timer._id,
        });
    }

    componentWillUnmount() {
        console.log('timer: ', this.state.timerId)
        clearInterval(this.state.timerId);
    }

    submit = async () => {
        this.setState({ stage: 'waiting' });

         await this.props.submitScore();

         this.setState({stage: 'opponent-waiting'});
    }

    render() {

        const numHits = this.props.board.board.filter(b => b === 3).length;
        const numOpponentHits = this.props.board.opponentsBoard.filter(b => b === 3).length;

        const { stage } = this.state;

        let modalContent = null;

        if (stage === 'start') {
            modalContent = (
                <div className="end-modal-content">
                    <div className="modal-title end-game-title">
                        score
                    </div>
                    <div className="big-label">
                        {numOpponentHits} - {numHits}
                    </div>
                    <button className="modal-create-btn" onClick={this.submit}>submit</button>
                    <div className="modal-warning-text">
                        You must submit the score to close the channel!
                    </div>
                </div>
            );
        } else if (stage === 'waiting') {
            modalContent = (
                <div className="end-modal-content">
                    <div className="modal-title end-game-title">
                        score
                    </div>
                    <div className="big-label">
                        {numOpponentHits} - {numHits}
                    </div>
                    <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
                    <div className="modal-warning-text">
                    Both players must close the channel...
                    </div>
                </div>
            );
        } else if (stage === 'opponent-waiting') {
            modalContent = (
                <div className="end-modal-content">
                    <div className="small-titles">
                        You have hit {numOpponentHits} ships and won {window.web3.fromWei(this.props.user.gameBetAmount / numOpponentHits, "ether")} ether
                    </div>
                    <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
                    <div className="modal-warning-text">
                     Waiting for your opponent to close the channel
                    </div>
                </div>
            );
        } else if (stage === 'finish') {
            modalContent = (
                <div className="end-modal-content">
                    <div className="modal-title end-game-title">
                        channel closed
                    </div>
                    <div className="big-label">
                        
                    </div>
                    <button className="modal-create-btn" onClick={this.props.playAgain}>play again</button>
                    <div className="modal-warning-text">
                     The games has finished!
                    </div>
                </div>
            );
        }

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

                            { modalContent }
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

export default connect(mapStateToProps, mapDispatchToProps)(EndGameModal);