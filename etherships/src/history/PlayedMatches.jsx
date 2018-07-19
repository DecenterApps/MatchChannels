import React, { Component } from 'react';
import { connect } from 'react-redux';

import './PlayedMatches.css';

class PlayedMatches extends Component {

  render() {
  
    return (
      <div>
         Matches and stuff
      </div>
    );
  }

}

const mapStateToProps = (props) => ({
  user: props.user,
  board: props.board,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(PlayedMatches);
