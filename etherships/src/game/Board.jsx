import React, { Component } from 'react';

import Field from './Field.jsx';

import './Board.css';

class Board extends Component {
    render() {
        return (
              <div className="container">
              <div className="board">
                <div className="pure-g">
                    <Field id="1" />
                    <Field id="2" />
                    <Field id="3" />
                    <Field id="4" />
                    <Field id="5" />
                    <Field id="6" />
                    <Field id="7" />
                    <Field id="8" />
                </div>

                <div className="row">
                    <Field id="9" />
                    <Field id="10" />
                    <Field id="11" />
                    <Field id="12" />
                    <Field id="13" />
                    <Field id="14" />
                    <Field id="15" />
                    <Field id="16" />
                </div> 

                <div className="row">
                    <Field id="17" />
                    <Field id="18" />
                    <Field id="19" />
                    <Field id="20" />
                    <Field id="21" />
                    <Field id="22" />
                    <Field id="23" />
                    <Field id="24" />
                </div> 

                <div className="row">
                    <Field id="25" />
                    <Field id="26" />
                    <Field id="27" />
                    <Field id="28" />
                    <Field id="29" />
                    <Field id="30" />
                    <Field id="31" />
                    <Field id="32" />
                </div> 

                <div className="row">
                    <Field id="33" />
                    <Field id="34" />
                    <Field id="35" />
                    <Field id="36" />
                    <Field id="37" />
                    <Field id="38" />
                    <Field id="39" />
                    <Field id="40" />
                </div> 

                <div className="row">
                    <Field id="41" />
                    <Field id="42" />
                    <Field id="43" />
                    <Field id="44" />
                    <Field id="45" />
                    <Field id="46" />
                    <Field id="47" />
                    <Field id="48" />
                </div> 

                <div className="row">
                    <Field id="49" />
                    <Field id="50" />
                    <Field id="51" />
                    <Field id="52" />
                    <Field id="53" />
                    <Field id="54" />
                    <Field id="55" />
                    <Field id="56" />
                </div> 

                <div className="row">
                    <Field id="57" />
                    <Field id="58" />
                    <Field id="59" />
                    <Field id="60" />
                    <Field id="61" />
                    <Field id="62" />
                    <Field id="63" />
                    <Field id="64" />
                </div>
                </div>
            </div>
 
        );
    }

}

export default Board;