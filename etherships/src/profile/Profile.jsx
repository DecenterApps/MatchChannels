import React, { Component } from 'react';

import './Profile.css';

import { getUser } from '../services/ethereumService';

class Profile extends Component {

	constructor(props) {
        super(props);

        this.state = {
            user: []
        };
    }

    async componentDidMount() {
        const user = await getUser(window.account);

        console.log(user);

        this.setState({
            user
        });
    }

    render() {
        return (
        	<div className='container'>
	            <div>
	            	<button className="back-button">back</button>
	                <div className='title-front'>
	                    battleship
	                </div>
	                <div className='small-titles'>
	                	profile
	                </div>
	                <div className='big-label'>
	                {
						this.state.user.length > 0 && this.state.user[0].toString()
					}
	                </div>
	                <div className='small-titles'>
	                	balance
	                </div>
	                <div className='big-label'> 
						{
							this.state.user.length > 0 && this.state.user[1].toString()
						} (ETH)
					</div>
					<div className="div-flex">
		                <div className="wrapper">
		                	<div id="inner1">
		                		<input className="input" type="text"/> 
		                	</div>
		                	<div id="inner2">
		                		<button className='btn'>Fund</button> 
		                	</div>
		                </div>

		                <div className="wrapper">
		                	<div id="inner1">
		                		<input className="input" type="text"/> 
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
						{this.state.user.length > 0 && this.state.user[2].toString()}/{this.state.user.length > 0 && this.state.user[3].toString()}
					</div>
	            </div>
            </div>
        );
    }

}


export default Profile;

