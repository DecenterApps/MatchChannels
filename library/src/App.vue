<template>
  <div id="app">
    <button @click="() => host()">Play as X (host)</button><br>
    <button @click="() => connect()">Play as O (connect)</button>
    <button @click="() => openChannel()">Open channel</button>
    <button @click="() => joinChannel()">Join channel</button>
    <button @click="() => fastClose()">Fast Close</button>

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
import stakeManager from "./../../solidity/build/contracts/StakeManager.json";
var address = "0x9671ffa84e9853cb5e8d35ca12acfc13c42f2764";

import utils from 'ethereumjs-util';

const stakeManager = web3.eth.contract(stakeManager.abi).at(address);

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

      const hashedState = web3.sha3(this.convertStateToBytes(state));

      return {
        ...state,
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
      const res2 = stakeManager.openChannel(0, (err, res) => {
          console.log(res);
      });
    },
    joinChannel() {
      stakeManager.nChannel.call((err, res) => {
        const channelNum = res.valueOf() - 1;

        console.log(channelNum);

        stakeManager.joinChannel(channelNum, (err, res) => {
          if(!err) {
            console.log('Channel joined');
          }
        });
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
      const s = {
        type: 'state',
        ...scope.getState,
        signedState: res,
        sequence: scope.turnNumber
      };

      console.log('Board: ', scope.board);

      scope.mySignedMoves.push(s);

      // send state
      conn.send(s);
    });
  },
  fastClose() {
    console.log(this.mySignedMoves[0]);
    // you must have at least 2 moves 
    if (this.mySignedMoves.length > 0 && this.opponentsSignedMoves.length > 0) {
      const firstMove = this.mySignedMoves[this.mySignedMoves.length - 1];
      const secondMove = this.opponentsSignedMoves[this.opponentsSignedMoves.length - 1];

      const sig1 = this.getRSV(firstMove.signedState);
      const sig2 = this.getRSV(secondMove.signedState);

      console.log(firstMove);

    stakeManager.nChannel.call((err, res) => {
        const channelNum = res.valueOf() - 1;

        const input = {
          channelId: channelNum,
          h: [firstMove.hashedState, secondMove.hashedState],
          v: [sig1.v, sig2.v],
          r: [sig1.r, sig2.r],
          s: [sig1.s, sig2.s],
          state: [this.convertStateToBytes(firstMove), this.convertStateToBytes(secondMove)]
        };

        console.log(input);

          stakeManager.fastClose(input.channelId, input.h, input.v, input.r, input.s, input.s, (res) => {
              console.log(res);
          });
    });

    } else {
      alert("Must have at least 2 moves");
    }
  },
  convertStateToBytes(state) {
    return '0x' + state.board.join('') + state.currMove + state.sequence;
  },
  getRSV(sgn) {
    const r = utils.toBuffer(sgn.slice(0,66))
    const s = utils.toBuffer('0x' + sgn.slice(66,130))
    const v = utils.toBuffer('0x' + sgn.slice(130,132))
    
    return {r: utils.bufferToHex(r), s: utils.bufferToHex(s), v: utils.bufferToInt(v)};
  },
  signState(cb) {

    const hashedState = this.getState.hashedState;

    var scope = this;

    var signedState = web3.eth.sign(web3.eth.accounts[0], hashedState, function(err, res) {
      if (err) {
        console.error(err);
      }

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
        that.opponentsSignedMoves.push(data);
        that.turnNumber++;
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
          that.opponentsSignedMoves.push(data);
          that.turnNumber++;
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
