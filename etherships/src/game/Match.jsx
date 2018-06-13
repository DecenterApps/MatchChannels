import React, { Component } from 'react';
import { connect } from 'react-redux';

import { generateBoard } from '../actions/boardActions';

import Board from './Board';

class Match extends Component {



    render() {


            return (
                <div className="container">
                    <div className="title">
                        battleship
                    </div>
                    <div className='instruction'>
                        The match has started
                    </div>
                  <div className="board-area">
                      <Board />
                    
                  </div>

                  <div>
                      <button className="next-btn">Submit</button>
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