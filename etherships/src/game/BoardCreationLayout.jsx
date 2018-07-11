import React, { Component } from 'react';
import { connect } from 'react-redux';

import { generateBoard, resetBoard } from '../actions/boardActions';

import Board from './Board';

class BoardCreationLayout extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
        };
    }

    generateBoard = () => {
        const { numPicked, board } = this.props.board;

        if (numPicked === 5) {
            this.props.generateBoard(board);

            this.setState({
                loading: true
            });
        }
    }

    componentDidMount() {
        this.props.resetBoard();
    }

    render() {
        const fieldsLeft = Array.from({length: 5 - this.props.board.numPicked}, (_, k) => k++);

        let btnStyle = "next-btn grey-btn";

        if (this.props.board.numPicked === 5) {
            btnStyle = "next-btn";
        }

        return (
            <div className="container">
                <div className="logo"></div>
                <div className='instruction'>
                    place your ships
                </div>
                <div className="board-area">
                    <Board type="my-board" state="setup" />
                    <div className="slots">
                      {
                          fieldsLeft.map(f =>
                              <div key={f} className="field slot-field" />
                          )
                      }
                    </div>
                </div>

            {
                !this.state.loading &&
                    <div>
                        <button className={btnStyle} onClick={this.generateBoard}>Next</button>
                    </div>
            }

            {
                this.state.loading &&
                <div>
                    <button className='next-btn waiting-btn'>
                        <div className="lds-ring-small">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </button>
                </div>
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
    resetBoard,
};

export default connect(mapStateToProps, mapDispatchToProps)(BoardCreationLayout);