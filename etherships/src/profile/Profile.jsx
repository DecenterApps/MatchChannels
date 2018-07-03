import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import { connect } from 'react-redux';

import './Profile.css';

import { fundAccount } from '../actions/userActions';

class Profile extends Component {

	constructor(props) {
        super(props);

        this.state = {
			fundValue: 0,
			withdrawValue: 0
        };
    }

    fundAccount = () => {
        this.props.fundAccount(this.state.fundValue);
        this.setState({fundValue: 0})
    };

    handleFundChange = (event) => {
        this.setState({ fundValue: event.target.value});
    };

    handleClick = () => {
        browserHistory.push("users");
    }

    render() {
        return (
        	<div className='container'>
	            <div>
	            	<button className="back-button" onClick={this.handleClick}>back</button>
	                <div className='title-front'>
	                    battleship
	                </div>
	                <div className='small-titles'>
	                	profile
	                </div>
	                <div className='big-label'>
	                {
	                	this.props.user.username
					}
	                </div>
	                <div className='small-titles'>
	                	balance
	                </div>
	                <div className='big-label'> 
						{
							this.props.user.balance
						} (ETH)
					</div>
					<div className="div-flex">
		                <div className="wrapper">
		                	<div id="inner1">
		                		<input className="input" type="text" onChange={this.handleFundChange} value={this.state.fundValue}/>
		                	</div>
		                	<div id="inner2">
		                		<button className='btn' onClick={this.fundAccount}>Fund</button>
		                	</div>
		                </div>

		                <div className="wrapper">
		                	<div id="inner1">
		                		<input className="input" type="text" value={this.state.withdrawValue}/>
		                	</div>
		                	<div id="inner2">
		                		<button className='btn'>Withdraw</button> 
		                	</div>
		                </div>
		            </div>
					
					<div className="small-titles">
						games
					</div>
					<div className="big-label">
						{this.props.user.finishedGames}/{this.props.user.gamesPlayed}
					</div>
	            </div>
            </div>
        );
    }

}

const mapStateToProps = (props) => ({
	user: props.user,
});
  
const mapDispatchToProps = {
	fundAccount,
};
  
export default connect(mapStateToProps, mapDispatchToProps)(Profile);


