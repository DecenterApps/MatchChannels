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
                      <Board type="setup" />
                      <div className="slots">
                      {
                          fieldsLeft.map( f => 
                            <div key={f} className="slot-field"></div>
                          )
                      }
                      </div>
                  </div>

                {
                    !this.state.loading && 
                        <div>
                        <button className="next-btn" onClick={this.generateBoard}>Next</button>
                        </div>
                }

                {
                    this.state.loading && 
                    <div>
                        <button className="spinner-btn" onClick={this.generateBoard}>
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