import React, { Component } from 'react';
import { connect } from 'react-redux';

import { submitGuess } from '../actions/boardActions';

import Board from './Board';

import Timer from './Timer';

class Match extends Component {

    guess = () => {
        this.props.submitGuess(this.props.board.recentGuess);
        console.log('submit guess');
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

        const { yourMove, timer } = this.props.board;

        const yourHits = Array.from({length: this.props.board.numHits}, (_, k) => k++); 

        const opponentHits = Array.from({length: this.props.board.numOpponentHits}, (_, k) => k++); 

        return (
            <div className="container">
                <div className="title">
                    battleship
                </div>

                {
                    !yourMove &&
                    <div className='instruction'>
                        Opponents turn
                    </div>
                }

            <div className="board-area match-board">
                <Board type={yourMove ? 'match' : 'waiting'} />
                
                <div className="score-area">
                    <div style={{display: 'flex'}}>
                        <div className="score-tiles">
                            <div className="small-titles">User 1</div>
                            <div className="slots">
                                {
                                    yourHits.map(h => 
                                        <div key={h} className="my-fields"></div>
                                    )
                                }
                            </div>
                        </div>

                        <div className="slots">
                            <div className="score-tiles">
                                <div className="small-titles">User 2</div>
                                {
                                    opponentHits.map(h => 
                                        <div key={h} className="opponent-fields"></div>
                                    )
                                }
                            </div>
                        </div>
                    </div>

                    <div className="timer-area">
                        <div className="small-titles"> Turn: {yourMove ? 'Your turn!' : 'Opponents turn!'}</div>
                        <Timer countdown={timer} />
                    </div>
                </div>
            </div>

            { !yourMove &&
                <div>
                    <div className="small-titles fun-fact">Fun fact: Vitalik created ethereum because he rage quit warcraft...noob</div>
                </div>
            }

            {
                yourMove &&
                <div>
                    <button className="next-btn" onClick={this.guess}>Submit</button>
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
    submitGuess,
};
  
export default connect(mapStateToProps, mapDispatchToProps)(Match);