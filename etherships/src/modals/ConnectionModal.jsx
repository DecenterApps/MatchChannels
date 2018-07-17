import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import './Modal.css';

import { customModalStyles } from '../constants/config';

class ConnectionModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      waiting: true,
    };
  }

  render() {

    return (
      <Modal
        isOpen
        onRequestClose={this.props.closeModal}
        contentLabel="Connecting..."
        style={customModalStyles}
      >

        {
          this.state.waiting &&
          <div className="modal-content">
            <div className="modal-title">
              Waiting for players answer
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
};

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionModal);