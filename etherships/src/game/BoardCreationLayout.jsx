import React, { Component } from 'react';
import { connect } from 'react-redux';

import { generateBoard } from '../actions/boardActions';

import Board from './Board';

class BoardCreationLayout extends Component {

    generateBoard = () => {
        const { numPicked, board } = this.props.board;

        if (numPicked === 5) {
            this.props.generateBoard(board, 'open');
        }
    }

    render() {
        const fieldsLeft = Array.from({length: 5 - this.props.board.numPicked}, (_, k) => k++); 

        console.log(fieldsLeft);

            return (
                <div className="container">
                    <div className="title">
                        battleship
                    </div>
                    <div className='instruction'>
                        place your ships
                    </div>
                  <div className="board-area">
                      <Board />
                      <div className="slots">
                      {
                          fieldsLeft.map( f => 
                            <div key={f} className="slot-field"></div>
                          )
                      }
                      </div>
                  </div>

                  <div>
                      <button className="next-btn">Next</button>
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