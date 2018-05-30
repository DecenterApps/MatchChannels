import React, { Component } from 'react'

class Home extends Component {
  render() {
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>EtherShips</h1>

            <div>
              <button> Enter lobby </button>
              <input type="text" />
            </div>

            <div>
              <h4>User list</h4>
            </div>
          </div>
        </div>
      </main>
    )
  }
}

export default Home
