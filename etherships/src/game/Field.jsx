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
            className="pure-u-1-8"
            onClick={this.clicked}
            style={{fontSize: '12px'}}
            >
            {
                board[this.props.id] === 1 && <span> 0.1 ETH</span>
            }
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