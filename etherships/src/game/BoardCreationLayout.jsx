import React, { Component } from 'react';
import { connect } from 'react-redux';

import { generateBoard } from '../actions/boardActions';

import Board from './Board';

class BoardCreationLayout extends Component {

    generateBoard = () => {
        const { numPicked, board } = this.props.board;

        if (numPicked === 5) {
            this.props.generateBoard(board);
        }
    }

    render() {
            return (
                <div className="container">
                  <div>
                      <button className="submit_btn" onClick={this.generateBoard}> Submit Board</button>
                      <span className="num_guess"> Num Guesses: { this.props.board.numPicked }/5 </span>

                      <Board />
                  </div>
                </div>
        );
    }

}

const mapStateToProps = (props) => ({
    ...props
});

const mapDispatchToProps = {
    generateBoard,
};
  
export default connect(mapStateToProps, mapDispatchToProps)(BoardCreationLayout);