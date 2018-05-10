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


import Peer from "peerjs";
import utils from 'ethereumjs-util';
import ethers from 'ethers';
import truffleContract from "truffle-contract";

import sManager from "./../../solidity/build/contracts/StakeManager.json";

// Set up web3 contract
const CONTRACT_ADDRESS = "0x3075d08c58595efb4e4463af9a0b48c65d5695c9";

const stakeManager = truffleContract(sManager);
stakeManager.setProvider(web3.currentProvider);

const stakeManagerInstance = stakeManager.at(CONTRACT_ADDRESS);

// Set up ether wallet for signing
const provider = ethers.providers.getDefaultProvider('kovan');
const wallet = ethers.Wallet.createRandom();
wallet.provider = provider;

const contract = new ethers.Contract(CONTRACT_ADDRESS, sManager.abi, provider);

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
      signedMoves: [],
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
    async openChannel() {
      console.log(0, wallet.address);
      const res2 = await stakeManagerInstance.openChannel(0, wallet.address, {from: web3.eth.accounts[0]});

      console.log('Channel opened');
    },
    async joinChannel() {
      const channelNum = await contract.nChannel() - 1;

      const res = await stakeManagerInstance.joinChannel(channelNum, wallet.address, {from: web3.eth.accounts[0]});
      
      console.log('Channel joined');
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
        type: 'send_sig',
        ...state,
        hashedState,
        signedState,
        sequence: this.turnNumber
      };

      this.signedMoves.push(msg);

      console.log('Created a move');

      conn.send(msg);
  },
  async fastClose() {
    const request = {type: 'request_win_sig', result: playerType.toString()};

    conn.send(request);

  },
  async dispute() {
    console.log(this.signedMoves);

    if (this.signedMoves.length >= 2) {
      const currMove = this.signedMoves[this.signedMoves.length - 1];
      const previousMove = this.signedMoves[this.signedMoves.length - 2];

      console.log(currMove, previousMove);

      const channelNum = await contract.nChannel() - 1;

      const hashes = [previousMove.hashedState, currMove.hashedState];

      const states = [utils.bufferToHex(utils.toBuffer(this.convertStateToBytes(previousMove))), 
                      utils.bufferToHex(utils.toBuffer(this.convertStateToBytes(currMove)))];

      console.log(channelNum, hashes, previousMove.signedState, currMove.signedState, states[0], states[1]);

      const res = await stakeManagerInstance.disputeMove(channelNum, hashes, previousMove.signedState,
       currMove.signedState, states[0], states[1], {from: web3.eth.accounts[0]});

       console.log(res);
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
    return wallet.signMessage(ethers.utils.arrayify(hashedState));
  },
  signStateMM(hashedState) {
    return new Promise((resolve, reject) => {
     web3.eth.sign(web3.eth.accounts[0], hashedState, (err, res) => {
         resolve(res);
       });
    });
  },
  async agreeAndSignState(result) {
    const channelNum = await contract.nChannel() - 1;

    let state = channelNum + result;

    state = state.padStart(9, '0');

    const hashedState = web3.sha3(state);

    const answer = confirm('Your opponent claims he won, do you want to sign that he is the winner?');

    if (answer) {
      const signedState = this.signState(hashedState);

      conn.send({
        type: 'receive_win_sig',
        state,
        hashedState,
        signedState,
        channelNum,
      });
    }
  },
  async callFastClose(data) {

    console.log(data.channelNum, data.hashedState, data.signedState, data.state);

    const res = await stakeManagerInstance.fastClose(data.channelNum,
        data.hashedState,
        data.signedState,
        utils.bufferToHex(utils.toBuffer(data.state)),
        {from: web3.eth.accounts[0]});

    console.log(res.logs[1].args.winner, web3.eth.accounts[0]);

    if (res.logs[1].args.winner === web3.eth.accounts[0]) {
      alert('You won yay!');
    }
  },
  signBack(data) {
    const hashedState = web3.sha3(this.convertStateToBytes(data));

    const signedState = this.signState(hashedState);

    const msg = {
      ...data,
      type: 'opponents_sig',
      hashedState,
      signedState,
      sequence: this.turnNumber
    };

    conn.send(msg);
  },
  async msgReceived(data) {
    switch(data.type) {
      case 'send_sig':
        this.board = data.board;
        this.opponentsSignedMoves.push(data);
        this.turnNumber++;
        
        this.signBack(data);
      break;
      case 'opponents_sig':
        console.log('Received opponents move');
        this.signedMoves.push(data);
      break;
      case 'request_win_sig':
        await this.agreeAndSignState(data.result);
      break;
      case 'receive_win_sig':
        await this.callFastClose(data);
      break;
    }
  },
  async connect() {
    await this.joinChannel();
    playerType = 2;

    this.switchToUse(2);

    peer = new Peer('connect', {
      key: 'asdf',
      debug: 3,
      host: '139.59.146.81',
      port: 9000,
    });

    conn = peer.connect('abc');
    conn.on('open', function(){
      this.showGame = true;

      conn.on('data', this.msgReceived);
    }.bind(this));
  },
  async host() {
    await this.openChannel();
    playerType = 1;

    peer = new Peer('abc', {
      key: 'asdf',
      debug: 3,
      host: '139.59.146.81',
      port: 9000,
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
