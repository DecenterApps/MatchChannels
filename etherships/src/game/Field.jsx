import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setField, guessField } from '../actions/boardActions';

import './Board.css';

class Field extends Component {

    chooseYourFields = () => {
        const { numPicked, board } = this.props.board;
        const pos = this.props.id;

        if (numPicked < 5 && board[pos] !== 1) {
            this.props.setField(pos);
        }
    }

    guessOppponentField = () => {
        const pos = this.props.id;

        this.props.guessField(pos);
    }

    render() {
        const { board, boardGuesses } = this.props.board;
        const { type } = this.props;

        let fieldClass = 'no-hover-field';

        if (board[this.props.id] === 1) {
            fieldClass = 'choosen';
        } else if (board[this.props.id] === 2) {
            fieldClass = 'field-miss';
        } else if(board[this.props.id] === 3) {
            fieldClass = 'field-hit';
        }

        if (type === 'setup') {
            return (
                <div 
                    className={(board[this.props.id] === 1 ? 'choosen' : 'field')}
                    onClick={this.chooseYourFields}>

                    <span className={board[this.props.id] === 1 ? "" : "pin"}></span>
                </div>
            )
        } else if (type === 'match') {
            return (
                <div 
                    className={(boardGuesses[this.props.id] === 1 ? 'red-choosen' : 'red-field')}
                    onClick={this.guessOppponentField}>


                    <span className={boardGuesses[this.props.id] === 1 ? "" : "pin"}></span>
                </div>
            )
        } else {
            return (
                <div 
                    className={fieldClass}>

                    <span className={board[this.props.id] !== 0 ? "" : "pin"}></span>
                </div>
            )
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