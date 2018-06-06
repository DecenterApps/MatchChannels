import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setField } from '../actions/boardActions';

import './Board.css';

class Field extends Component {

    clicked = () => {
        const { numPicked, board } = this.props.board;
        const pos = this.props.id;

        if (numPicked < 5 && board[pos] !== 1) {
            this.props.setField(pos);
        }
    }

    render() {
        const { board } = this.props.board;

        return (
            <div 
            className={(board[this.props.id] === 1 ? 'choosen' : 'field')}
            onClick={this.clicked}
            >

            <span className={board[this.props.id] === 1 ? "" : "pin"}>
                
            </span>
            </div>
        )
    }

}

const mapStateToProps = (props) => ({
    ...props
});

const mapDispatchToProps = {
    setField,
};
  
export default connect(mapStateToProps, mapDispatchToProps)(Field);