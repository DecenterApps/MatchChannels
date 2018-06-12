import React, { Component } from 'react'

import { connect } from 'react-redux';

import { setName, editName, editPrice, register } from './actions/userActions';

class Home extends Component {

  render() {
    const { userNameEdit, registered } = this.props.user;
    const { setName, editName, priceEdit, editPrice, register } = this.props;

    console.log(this.props.board);

    return(
      <main className="container">
        <div>
            {
              !registered && 
                <div>

                    <div className="title-front"> battleship</div>
                    <div>
                        <input type="text" className="name-input" placeholder="Name" onChange={editName} value={userNameEdit} />
                    </div>

                    <div>
                        <input type="text" className="stake-input" onChange={editPrice} value={priceEdit} placeholder="Default 0.001 eth" />
                    </div>

                    <button className="register-btn" onClick={register}>Register</button>
                </div>
            }

            {
                registered &&
                <div>

                    <a href='/profile'>Profile</a>

                    <div className="title-front"> battleship</div>
                    <div>
                        <input type="text" className="name-input" placeholder="Name" onChange={editName} value={userNameEdit} disabled/>
                    </div>

                    <button className="register-btn" onClick={setName}>Start</button>
                </div>
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
