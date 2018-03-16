<template>
  <div id="app">
    <button @click="() => host()">Play as X (host)</button><br>
    <button @click="() => connect()">Play as O (connect)</button>
    <button @click="() => openChannel()">Open channel</button>
    <button @click="() => joinChannel()">Join channel</button>

    <div id="game-wrapper" v-show="showGame">
      <button 
        v-for="j, i in board"
        @click="() => play(i)"
      >
        {{numToChar(board[i])}}
      </button>
    </div>
    <div>
      {{ this.board }}
    </div>

    <div>
      {{ getState }}
    </div>
  </div>
</template>

<script>


var Peer = require("peerjs");
import abi from "./../../solidity/out/StakeManager.abi";
var address = "0xcc4fb653540d7995da1b503a073aa476ba958c78";

const stakeManager = web3.eth.contract(JSON.parse(abi)).at(address);

var peer;
var conn;

export default {
  data() {
    return {
      showGame: false,
      char: 1,
      board: [0,0,0,0,0,0,0,0,0],
      turnNumber: 0,
      lastMove: -1,
      mySignedMoves: [],
      opponentsSignedMoves: [],
    }
  },
  computed: {
    getState: function () {
      var state = {
        currMove: this.lastMove, 
        board: this.board,
        sequence: this.turnNumber
      };

      const hashedState = web3.sha3(JSON.stringify(state));

      return {
        board: this.board,
        turnNumber: this.turnNumber,
        hashedState: hashedState
      };
    }
  },
  methods: {
    numToChar(i) {
      switch (i) {
        case 1: return 'x';
        case 2: return 'o';
      }
    },
    openChannel() {
      const res2 = stakeManager.openChannel(0, (res) => {
          console.log(res);
      });
    },
    joinChannel() {
      const res2 = stakeManager.joinChannel(0, (res) => {
        console.log(res);
      });
    },
    switchToUse(char) {
      this.char = char;
    },
    play(i) {
      this.lastMove = i;
      this.board.splice(i, 1, this.char);
      this.turnNumber++;

    var scope = this;

    this.signState(function(res) {
      // send state
      conn.send({
        type: 'state',
        ...scope.getState,
        signedState: res,
      });
    });
  },
  signState(cb) {

    const hashedState = this.getState.hashedState;

    var data = this;

    var signedState = web3.eth.sign(web3.eth.accounts[0], hashedState, function(err, res) {
      if (err) {
        console.error(err);
      }

      data.mySignedMoves.push(res);

      cb(res);
    });
  },
  connect() {
    const that = this;
    this.switchToUse(2);
    peer = new Peer('connect', {
      key: 'knxp6u684ytu766r',
      debug: 3,
    });
    conn = peer.connect('ab');
    conn.on('open', function(){
      that.showGame = true;
    });
    conn.on('data', function(data){
      console.log('Message', data);
      if (data.type === 'state') {
        that.board = data.board;
      }
    });
  },
  host() {
    const that = this;
    peer = new Peer('ab', {
      key: 'knxp6u684ytu766r',
      debug: 3,
    });
    peer.on('connection', function(_conn) {
      that.showGame = true;
      conn = _conn
      conn.on('data', function(data){
        console.log('Message', data);
        if (data.type === 'state') {
          that.board = data.board;
        }
      });
    });
  }
}
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
#game-wrapper {
  display: flex;
  flex-wrap: wrap;
  width: 300px;
  margin: 20px;
}
#game-wrapper button {
  width: 100px;
  height: 100px;
  border: 0;
  background: transparent;
  font-size: 24px;
  border: 1px solid gray;
}
</style>
