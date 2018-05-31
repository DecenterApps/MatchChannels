import React, { Component } from 'react';
import { connect } from 'react-redux';

import Field from './Field.jsx';
import { generateBoard } from '../actions/boardActions';

import { BOARD_LENGTH } from '../constants/config';

import './Board.css';

class Board extends Component {

    render() {

        const { board } = this.props.board;

        const rows = Array.from({length: BOARD_LENGTH}, (_, k) => k++); 

        return (
              <div className="board">
                {
                    rows.map((_, index) => {
                         return (
                            <div className="row" key={index}>
                                {
                                    board.slice(index * BOARD_LENGTH, ((index + 1) * BOARD_LENGTH)).map((type, i) => 
                                        <Field key={i} id={(index*8) + i}/>
                                    )
                                }
                            </div>
                         );}
                    )
                    
                }
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
  
export default connect(mapStateToProps, mapDispatchToProps)(Board);
