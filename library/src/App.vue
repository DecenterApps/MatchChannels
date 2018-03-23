<template>
  <div id="app">
    <button @click="() => host()">Open Channel</button><br>
    <button @click="() => connect()">Join Channel</button>
    <button @click="() => fastClose()">Fast Close</button>
    <button @click="() => dispute()">Dispute</button>

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
import sManager from "./../../solidity/build/contracts/StakeManager.json";
var address = "0x89b60aaf8434bff5ad7092b3a73a52b81cdf9593";

import utils from 'ethereumjs-util';

const stakeManager = web3.eth.contract(sManager.abi).at(address);

var peer;
var conn;

let playerType = 0;

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
    const request = {type: 'request_sig', result: playerType.toString()};

    conn.send(request);
  },
  dispute() {
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

       console.log(this.convertStateToBytes(firstMove), this.convertStateToBytes(secondMove));

        const s1 = utils.bufferToHex(utils.toBuffer(this.convertStateToBytes(firstMove)));
        const s2 = utils.bufferToHex(utils.toBuffer(this.convertStateToBytes(secondMove)));

        const input = {
          channelId: channelNum,
          h: [web3.sha3(this.convertStateToBytes(firstMove)), web3.sha3(this.convertStateToBytes(secondMove))],
          v: [sig1.v, sig2.v],
          r: [sig1.r, sig2.r],
          s: [sig1.s, sig2.s],
          s1,
          s2
        };

        console.log(input);

        stakeManager.close(input.channelId, input.h, input.v, input.r, input.s, input.s1, input.s2, (res) => {
            console.log(res);
        });
    });

    } else {
      alert("Must have at least 2 moves");
    }
  },
  convertStateToBytes(state) {
    let parsedState = state.board.join('') + state.currMove + state.sequence;

    return (parsedState.length % 2 === 0) ? parsedState : parsedState + '0';
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
  agreeAndSignState(result) {
     stakeManager.nChannel.call((err, res) => {
      const channelNum = res.valueOf() - 1;

      let state = channelNum + result;

      state = state.padStart(9, '0');

      const hashedState = web3.sha3(state);

      web3.eth.sign(web3.eth.accounts[0], hashedState, (err, signedState) => {
        conn.send({
          type: 'receive_sig',
          state,
          hashedState,
          signedState,
          channelNum,
        });
      });

    });
  },
  callFastClose(data) {
    const {r, s, v} = this.getRSV(data.signedState);

    console.log(data.channelNum,
        data.hashedState,
        v,
        r,
        s,
        utils.bufferToHex(utils.toBuffer(data.state)));

    stakeManager.fastClose(data.channelNum,
        data.hashedState,
        v,
        r,
        s,
        utils.bufferToHex(utils.toBuffer(data.state)),
        {from: web3.eth.accounts[0]}, (err, res) => {
          console.log(res);
        });
  },
  connect() {
    this.joinChannel();

    playerType = 2;

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
      } else if(data.type === 'request_sig') {
        that.agreeAndSignState(data.result);
      } else if(data.type === 'receive_sig') {
          that.callFastClose(data);
        }
    });
  },
  host() {
    this.openChannel();

    playerType = 1;

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
        } else if(data.type === 'request_sig') {
          that.agreeAndSignState(data.result);
        } else if(data.type === 'receive_sig') {
          that.callFastClose(data);
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
