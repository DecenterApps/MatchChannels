import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router'

import { editName, editPrice, register } from './actions/userActions';

class Home extends Component {
  componentWillMount() {
    if (this.props.user.registered) browserHistory.push('/users');
  }

  render() {
    const { userNameEdit, registered } = this.props.user;
    const { editName, priceEdit, editPrice, register } = this.props;

    return (
      <main>
        <div>
          {
            !registered &&
            <div className="home-content">
              <div className='logo' />

              <div className='register-label'>register</div>

              <div className="reg-inputs-group">
                <div>
                  <input type="text" maxLength="14" className="name-input" placeholder="Name" onChange={editName} value={userNameEdit} />
                </div>

                <div>
                  <input type="number" className="stake-input" onChange={editPrice} value={priceEdit} placeholder="Credits (ETH)" />
                </div>
              </div>

              <button className="register-btn" onClick={register}>start</button>
            </div>
          }

          <div className="left-ship" />
          <div className="right-ship" />
        </div>
      </main>
    );
  }
}

const mapStateToProps = (props) => ({
  user: props.user,
  board: props.board
});

const mapDispatchToProps = {
  editName,
  editPrice,
  register,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
