import React, { Component } from 'react';

import Modal from 'react-modal';

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

class Profile extends Component {

    render() {
        return (
            <Modal
                    isOpen={this.props.modalIsOpen}
                    onRequestClose={this.props.closeModal}
                    contentLabel="Create Game"
                    style={customStyles}
                >

                    <div className="modal-content">
                        <div className="modal-title">
                            create game
                        </div>

                        <div>
                            <input className="modal-input-eth" type="number" placeholder="AMOUNT (ETH)" />
                        </div>

                        <button className="modal-create-btn">create</button>

                    </div>
                  
                    </Modal>
        );
    }

}


export default Profile;