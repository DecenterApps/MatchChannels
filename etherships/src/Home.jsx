import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router'

import { editName, editPrice, register } from './actions/userActions';

class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  componentWillMount() {
    if (this.props.user.registered) browserHistory.push('/users');
  }

  registerUser = () => {

    this.setState({
      loading: true
    });

    this.props.register();
  }

  render() {
    const { userNameEdit, registered } = this.props.user;
    const { editName } = this.props;

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
              </div>

              {
                this.state.loading && 
                  <button className="register-btn waiting-btn">
                    <div className="lds-ring-small">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                  </button>
              }

              {
                !this.state.loading && 
                  <button className="register-btn" onClick={this.registerUser}>start</button>
              }
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
