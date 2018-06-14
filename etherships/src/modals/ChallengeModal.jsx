import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from 'react-modal';

import { newGame } from '../actions/userActions';

import './Modal.css';

const customStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)',
      background: '#302E38'
    },
    overlay: {
        backgroundColor: 'rgba(15, 13, 13, 0.8)',
    }
};

class ChallengeModal extends Component {

    clicked = () => {
        console.log("Accepted");

        console.log(this.props.user.connection);

        this.props.user.connection.send({type:'accepted', channelId: this.props.channelId, amount: this.props.amount});

        this.props.closeModal();
    }

    render() {

        return (
            <Modal
                    isOpen={this.props.modalIsOpen}
                    onRequestClose={this.props.closeModal}
                    contentLabel="Challenge"
                    style={customStyles}
                >

                    <div className="modal-content">
                        <div className="modal-title">
                            You were challenged by { this.props.username }
                        </div>

                        <button className="modal-create-btn" onClick={this.clicked}>Accept</button>

                    </div>
                  
                    </Modal>
        );
    }

}

const mapStateToProps = (props) => ({
    user: props.user,
});

const mapDispatchToProps = {
    newGame
};

export default connect(mapStateToProps, mapDispatchToProps)(ChallengeModal);