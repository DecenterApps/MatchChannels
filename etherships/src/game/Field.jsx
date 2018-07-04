import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setField, guessField } from '../actions/boardActions';

import { EMPTY_FIELD, PLAYERS_SHIP, MISSED_SHIP, SUNK_SHIP} from '../constants/config';

import './Board.css';

class Field extends Component {

    chooseYourFields = () => {
        const { numPicked, board } = this.props.board;
        const pos = this.props.id;

        if (board[pos] === PLAYERS_SHIP || numPicked < 5) {
            this.props.setField(this.props.id);
        }
    }

    guessOppponentField = () => {
        if (this.props.state === 'match') {
            const pos = this.props.id;
            this.props.guessField(pos);
        }
    }

    render() {
        const { board, opponentsBoard } = this.props.board;
        const { state, type } = this.props;

        let fieldClass = 'no-hover-field';
        
        if (board[this.props.id] === PLAYERS_SHIP) {
            fieldClass = 'choosen';
        } else if (board[this.props.id] === MISSED_SHIP) {
            fieldClass = 'field-miss';
        } else if(board[this.props.id] === SUNK_SHIP) {
            fieldClass = 'field-hit';
        }

        let guessFieldClass = 'red-field';

        if (opponentsBoard[this.props.id] === MISSED_SHIP) {
            guessFieldClass = 'field-miss';
        } else if(opponentsBoard[this.props.id] === SUNK_SHIP) {
            guessFieldClass = 'field-hit-red';
        }

        if (state === 'waiting') {
            guessFieldClass += ' nohover';
        }

        if (state === 'setup') {
            return (
                <div 
                    className={(board[this.props.id] === PLAYERS_SHIP ? 'choosen' : 'field')}
                    onClick={this.chooseYourFields}>

                    <span className={board[this.props.id] === PLAYERS_SHIP ? "" : "pin"}></span>
                </div>
            )
        } else {
            if (type === 'my-board') {
                return (
                    <div 
                        className={fieldClass}>
    
                        <span className={board[this.props.id] !== EMPTY_FIELD ? "" : "pin"}></span>
                    </div>
                )
            } else {
                return (
                    <div 
                        className={guessFieldClass}
                        onClick={this.guessOppponentField}>
    
    
                        <span className={opponentsBoard[this.props.id] !== EMPTY_FIELD ? "" : "pin"}></span>
                    </div>
                )
            }
        }
    }

}

const mapStateToProps = (props) => ({
    ...props
});

const mapDispatchToProps = {
    setField,
    guessField,
};
  
export default connect(mapStateToProps, mapDispatchToProps)(Field);