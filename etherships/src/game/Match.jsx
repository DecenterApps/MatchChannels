import React, { Component } from 'react';
import { connect } from 'react-redux';

import { generateBoard, submitGuess } from '../actions/boardActions';

import Board from './Board';

class Match extends Component {

    guess = () => {
        this.props.submitGuess(this.props.board.recentGuess);
    }

    componentDidMount() {
        if (this.props.peer) {
            this.props.peer.on('connection', (_conn) => {
                _conn.on('data', (res) => {
                    console.log('Move: ', res);
                });

            });
        }
    }

    render() {

        const { yourMove } = this.props.board;

        if (yourMove) {
            return (
                <div className="container">
                    <div className="title">
                        battleship
                    </div>
                    <div className='instruction'>
                        choose location
                    </div>
                <div className="board-area">
                    <Board type="match"/>
                    
                </div>

                <div>
                    <button className="next-btn" onClick={this.guess}>Submit</button>
                </div>
                </div>
            );
        } else {
            return (
                <div className="container">
                    <div className="title">
                        battleship
                    </div>

                    <div className='instruction'>
                        Opponents turn
                    </div>

                <div className="board-area">
                    <Board type="waiting" />
                    
                </div>

                <div>
                    <span>Fun fact: Vitalik created ethereum because he rage quit warcraft...noob</span>
                </div>
                </div>
            );
        }

    }

}

const mapStateToProps = (props) => ({
    ...props
});

const mapDispatchToProps = {
    submitGuess,
};
  
export default connect(mapStateToProps, mapDispatchToProps)(Match);