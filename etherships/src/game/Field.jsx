import React, { Component } from 'react';
import { connect } from 'react-redux';

import './Board.css';

class Field extends Component {

    constructor() {
        super();

        this.state = {
            clicked: false
        };
    }

    clicked = () => {
        console.log('Field clicked: ', this.props.id);

        this.setState({
            clicked: true
        });
    }

    render() {
        return (
            <div 
            className="pure-u-1-8"
            onClick={this.clicked}
            style={{fontSize: '12px'}}
            >
            {
                this.state.clicked && <span> 0.1 ETH</span>
            }
            </div>
        )
    }

}

const mapStateToProps = (props) => ({
    ...props
});
  
export default connect(mapStateToProps)(Field);