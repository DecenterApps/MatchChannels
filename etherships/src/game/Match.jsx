import React, { Component } from 'react';
import { connect } from 'react-redux';

import { openModal, closeEndGameModal } from '../actions/boardActions';

import Board from './Board';
import Timer from './Timer';

class Match extends Component {

    render() {
        const { isYourMove, timer } = this.props.board;

        const numHits = this.props.board.board.filter(b => b === 3).length;
        const numOpponentHits = this.props.board.opponentsBoard.filter(b => b === 3).length;

        return (
            <div className="container">
                <div className='logo' />


            <div className="match-info-row">
                <div className="board-title">Your Board</div>

                <div className="score-text">{ numHits } : { numOpponentHits }</div>

                <div className="board-title">Opponent Board</div>
            </div>


            <div className="board-area match-board">
                <Board state={isYourMove ? 'waiting' : 'match'} type='my-board' />

                <Board state={isYourMove ? 'match' : 'waiting'} type='opponent' />
            </div>

            <div className="timer-area">
                <span className="turn-text">{isYourMove ? 'Your turn' : 'Opponents turn'}  </span>
                <Timer countdown={timer} />
            </div>

            </div>
        );

    }

}

const mapStateToProps = (props) => ({
    ...props
});

const mapDispatchToProps = {
    openModal,
    closeEndGameModal,
};
  
export default connect(mapStateToProps, mapDispatchToProps)(Match);