<template>
  <div id="app">

    <div id="address">
      Your address: <b><u> {{ wallet.address }} </u></b>
    </div>

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


const Peer = require("peerjs");
import sManager from "./../../solidity/build/contracts/StakeManager.json";
const address = "0x71d6045d993f033f4f4f0478a5ba4aab0b918b64";

import utils from 'ethereumjs-util';

const stakeManager = web3.eth.contract(sManager.abi).at(address);

const ethers = require('ethers');
const provider = ethers.providers.getDefaultProvider('kovan');

const wallet = ethers.Wallet.createRandom();
wallet.provider = provider;

const contract = new ethers.Contract(address, sManager.abi, provider);

let peer, conn;
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
      wallet,
    }
  },
  computed: {
    getState: function () {
      return {
        currMove: this.lastMove, 
        board: this.board,
        sequence: this.turnNumber,
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
      const res2 = stakeManager.openChannel(0, wallet.address, (err, res) => {
          console.log(res);
      });
    },
    async joinChannel() {
      const channelNum = await contract.nChannel() - 1;

      stakeManager.joinChannel(channelNum, wallet.address, (err, res) => {
        if(!err) {
          console.log('Channel joined');
        }
      });
    },
    switchToUse(char) {
      this.char = char;
    },
    async play(i) {
      this.lastMove = i;
      this.board.splice(i, 1, this.char);
      this.turnNumber++;

      const state = this.getState;

      const hashedState = web3.sha3(this.convertStateToBytes(state));
      const signedState = this.signState(hashedState);

      console.log('Signed state: ', signedState);

      const msg = {
        type: 'state',
        ...state,
        signedState,
        sequence: this.turnNumber
      };

      this.mySignedMoves.push(msg);

      conn.send(msg);
  },
  fastClose() {
    const request = {type: 'request_sig', result: playerType.toString()};

    conn.send(request);
  },
  async dispute() {
    console.log(this.mySignedMoves, this.opponentsSignedMoves);

    // you must have at least 2 moves 
    if (this.mySignedMoves.length > 0 && this.opponentsSignedMoves.length > 0) {
      const firstMove = this.mySignedMoves[this.mySignedMoves.length - 1];
      const secondMove = this.opponentsSignedMoves[this.opponentsSignedMoves.length - 1];

      const sig1 = this.getRSV(firstMove.signedState);
      const sig2 = this.getRSV(secondMove.signedState);

      console.log(firstMove);

      const channelNum = await contract.nChannel() - 1;

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
  signState(hashedState) {
    return wallet.signMessage(hashedState);
  },
  async agreeAndSignState(result) {
    const channelNum = await contract.nChannel() - 1;

    let state = channelNum + result;

    state = state.padStart(9, '0');

    const hashedState = web3.sha3(state);

    const signedState = this.signState(hashedState);

    conn.send({
      type: 'receive_sig',
      state,
      hashedState,
      signedState,
      channelNum,
    });
  },
  callFastClose(data) {
    const {r, s, v} = this.getRSV(data.signedState);

    stakeManager.fastClose(data.channelNum,
        data.hashedState,
        v,
        r,
        s,
        utils.bufferToHex(utils.toBuffer(data.state)),
        {from: web3.eth.accounts[0]}, (err, res) => { console.log(res); });
  },
  async msgReceived(data) {
    switch(data.type) {
      case 'state':
        this.board = data.board;
        this.opponentsSignedMoves.push(data);
        this.turnNumber++;
      break;
      case 'request_sig':
        await this.agreeAndSignState(data.result);
      break;
      case 'receive_sig':
        this.callFastClose(data);
      break;
    }
  },
  async connect() {
    this.joinChannel();
    playerType = 2;

    this.switchToUse(2);

    peer = new Peer('connect', {
      key: '05q6s34ba66iggb9',
      debug: 3,
    });

    conn = peer.connect('ab');
    conn.on('open', function(){
      this.showGame = true;
    }.bind(this));

    conn.on('data', this.msgReceived);
  },
  async host() {
    this.openChannel();
    playerType = 1;

    peer = new Peer('ab', {
      key: '05q6s34ba66iggb9',
      debug: 3,
    });

    peer.on('connection', function(_conn) {
      this.showGame = true;
      conn = _conn;
      conn.on('data', this.msgReceived);
    }.bind(this));
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

#address {
  margin-bottom: 50px;
}
</style>
