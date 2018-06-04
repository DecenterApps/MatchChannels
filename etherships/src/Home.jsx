import React, { Component } from 'react'

import Lobby from './lobby/Lobby';

class Home extends Component {

  render() {
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>EtherShips</h1>

            <Lobby />
          </div>
        </div>
      </main>
    )
  }
}

export default Home
