import React, { Component } from 'react'

import Lobby from './lobby/Lobby';

class Home extends Component {

  render() {
    return(
      <main className="container">
            <Lobby />
      </main>
    )
  }
}

export default Home
