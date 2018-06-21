import React, { Component } from 'react'

import { connect } from 'react-redux';

import { setName, editName, editPrice, register } from './actions/userActions';

import Lobby from './lobby/Lobby';

class Home extends Component {

  render() {
    const { userNameEdit, registered } = this.props.user;
    const { setName, editName, priceEdit, editPrice, register } = this.props;

    console.log(this.props.board);

    return(
      <main>
        <div>
            {
              !registered && 
                <div>

                    <div className="title-front"> battleship</div>
                    <div>
                        <input type="text" className="name-input" placeholder="Name" onChange={editName} value={userNameEdit} />
                    </div>

                    <div>
                        <input type="text" className="stake-input" onChange={editPrice} value={priceEdit} placeholder="Credits (ETH)" />
                    </div>

                    <button className="register-btn" onClick={register}>Register</button>
                </div>
            }

            {
                registered &&
                  <Lobby />
            }
        </div>
      </main>
    )
  }
}

const mapStateToProps = (props) => ({
  user: props.user,
  board: props.board
});

const mapDispatchToProps = {
  setName,
  editName,
  editPrice,
  register,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
