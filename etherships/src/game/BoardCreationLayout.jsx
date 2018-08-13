import React, { Component } from 'react';
import { connect } from 'react-redux';

import { generateBoard, resetBoard, selectShip } from '../actions/boardActions';

import Board from './Board';

class BoardCreationLayout extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            selected: [false, false, false, false, false],
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
    
    selectShip = (index, type) => {
        let newSelection = this.state.selected.map(s => s = false);

        newSelection[index] = true;

        this.setState({
            selected: newSelection
        });

        this.props.selectShip(type);
    }

    render() {
        const { gameBetAmount } = this.props.user;

        const { selected } = this.state;

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

                    <div className='board-right-area'>
                        <div className="slots">
                           {
                               !this.props.board.shipsPlaced[0] &&
                               <div className={selected[0] === true ? ' one-square-ship selected' : 'one-square-ship'} onClick={() => this.selectShip(0, 1)}></div>

                           }

                            <div>
                                {
                                    !this.props.board.shipsPlaced[1] &&
                                    <div className={selected[1] === true ? ' two-square-ship selected' : 'two-square-ship'} onClick={() => this.selectShip(1, 2)}></div>
                                }

                                {
                                    !this.props.board.shipsPlaced[2] &&
                                    <div className={selected[2] === true ? ' two-square-ship selected' : 'two-square-ship'} onClick={() => this.selectShip(2, 2)}></div>
                                }
                            </div>

                            {
                                !this.props.board.shipsPlaced[3] &&
                                <div className={selected[3] === true ? ' three-square-ship selected' : 'three-square-ship'} onClick={() => this.selectShip(3, 3)}></div>

                            }

                            {
                                !this.props.board.shipsPlaced[4] &&
                                <div className={selected[4] === true ? ' four-square-ship selected' : 'four-square-ship'} onClick={() => this.selectShip(4, 4)}></div>
                            }
                        </div>

                        <div>
                            <div className="stake-info-title">
                                Match stake:
                                <div className="stake-info-value"> { window.web3.fromWei(gameBetAmount, 'ether') } <span className='eth-value-text'>eth</span> </div>
                            </div>

                            <div className="stake-info-title">
                                Ship value:
                                <div className="stake-info-value"> { window.web3.fromWei(gameBetAmount/5, 'ether') } <span className='eth-value-text'>eth</span> </div>
                            </div>
                        </div>
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
    selectShip,
};

export default connect(mapStateToProps, mapDispatchToProps)(BoardCreationLayout);