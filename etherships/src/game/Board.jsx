import React, { Component } from 'react';
import { connect } from 'react-redux';

import Field from './Field.jsx';
import { generateBoard } from '../actions/boardActions';

import { BOARD_LENGTH } from '../constants/config';

import { getRandomInt } from '../services/boardService';

import './Board.css';

class Board extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedField: -1,
            interval: null,
        };
    }

    //TODO: this is an animation of the other user selecting your fields while you wait your turn
    //Had an issue with unmounted component in setState
    // componentDidMount() {
    //     const interval = setInterval(() => {
    //         const selectedField  = getRandomInt(63);

    //         this.setState({
    //             selectedField
    //         });
    //     }, 500);

    //     this.setState({
    //         interval,
    //     });
    // }

    // componentWillUnmount() {
    //     clearInterval(this.state.interval);
    // }

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
                                        <Field key={i} id={(index*8) + i} type={this.props.type} selectedField={this.state.selectedField}/>
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
