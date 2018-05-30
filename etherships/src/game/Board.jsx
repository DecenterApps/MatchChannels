import React, { Component } from 'react';
import { connect } from 'react-redux';

import Field from './Field.jsx';

import { BOARD_LENGTH } from '../constants/config';

import './Board.css';

class Board extends Component {

    constructor(props) {
        super(props);

    }

    render() {

        const { board } = this.props.board;

        const rows = Array.from({length: BOARD_LENGTH}, (_, k) => k++); 

        return (
            <div className="container">
              <div className="board">
                {
                    rows.map((_, index) => {
                         return (
                            <div className="row" key={index}>
                                {
                                    board.slice(index * BOARD_LENGTH, ((index + 1) * BOARD_LENGTH)).map((type, i) => 
                                        <Field key={i} id={i}/>
                                    )
                                }
                            </div>
                         );}
                    )
                    
                }
              </div>
            </div>
        );

    }

}

const mapStateToProps = (props) => ({
    ...props
});
  
export default connect(mapStateToProps)(Board);
