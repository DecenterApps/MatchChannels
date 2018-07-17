import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import { acceptChallenge, declineChallenge } from '../actions/userActions';
import { closeModal } from '../actions/modalActions';
import './Modal.css';

import { customModalStyles } from '../constants/config';

class ChallengeModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      waiting: false,
    };
  }

  accept = () => {
    this.props.acceptChallenge();
    this.setState({ waiting: true });
  };
  
  decline = () => {
    this.props.declineChallenge();
  };

  render() {

    return (
      <Modal
        isOpen
        onRequestClose={this.props.closeModal}
        contentLabel="Challenge"
        style={customModalStyles}
      >

        {
          !this.state.waiting &&
          <div className="modal-content">
            <div className="modal-title">
              You were challenged by: {this.props.modalData && this.props.modalData.username}
            </div>

            <div className="two-btn-row">
              <button className="modal-create-btn" onClick={this.accept}>Accept</button>
              <button className="modal-decline-btn" onClick={this.decline}>Decline</button>
            </div>

          </div>
        }

        {
          this.state.waiting &&
          <div className="modal-content">
            <div className="modal-title">
              Waiting for your opponent..
            </div>

            <div className="lds-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>

          </div>
        }

      </Modal>
    );
  }

}

const mapStateToProps = (state) => ({
  user: state.user,
  modalData: state.modal.modalData
});

const mapDispatchToProps = {
  acceptChallenge,
  closeModal,
  declineChallenge,
};

export default connect(mapStateToProps, mapDispatchToProps)(ChallengeModal);