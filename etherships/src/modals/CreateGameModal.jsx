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

class CreateGameModal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            ethAmount: 0
        };
    }

    handleChange = (event) => {
        this.setState({ethAmount: event.target.value});
    }

    clicked = () => {
        this.props.newGame(this.state.ethAmount);
    }


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
                            <input className="modal-input-eth" value={this.state.ethAmount} onChange={this.handleChange} type="text" placeholder="AMOUNT (ETH)" />
                        </div>

                        <button className="modal-create-btn" onClick={this.clicked}>create</button>

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

export default connect(mapStateToProps, mapDispatchToProps)(CreateGameModal);