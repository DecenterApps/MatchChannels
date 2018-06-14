import React, { Component } from 'react';
import { connect } from 'react-redux';

import { generateBoard } from '../actions/boardActions';

import Board from './Board';

class Match extends Component {

    submitGuess = () => {
        const index  = this.props.guessBoard.findIndex(b => b === 1);

        if (index != -1) {
            
        }
    }

    render() {

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
                      <button className="next-btn" onClick={this.submitGuess}>Submit</button>
                  </div>
                </div>
        );
    }

}

const mapStateToProps = (props) => ({
    ...props
});

const mapDispatchToProps = {
};
  
export default connect(mapStateToProps, mapDispatchToProps)(Match);