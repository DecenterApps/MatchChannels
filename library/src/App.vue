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
const CONTRACT_ADDRESS = "0x00a3e96db6b34a6978a42168b1b592161c2bab3a";

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
        signedState,
        sequence: this.turnNumber
      };

      // this.mySignedMoves.push(msg);
      this.signedMoves.push(msg);

      console.log('PLAY');

      conn.send(msg);
  },
  async fastClose() {
    const request = {type: 'request_win_sig', result: playerType.toString()};

    conn.send(request);

    // const hashMsg = ethers.utils.solidityKeccak256(['string'], ['000000001']);

    // var hashData = ethers.utils.arrayify(hashMsg);

	  // const signature = wallet.signMessage(hashData);

    // console.log(`"${hashMsg}", "${signature}"`);

    // // const signMM = await this.signStateMM(hashMsg);

    // // console.log(`"${hashMsg}", "${signMM}"`);

    // var sig = this.getRSV(signature);

    // const res = await stakeManagerInstance.recoverSig(hashMsg, signature, utils.bufferToHex(utils.toBuffer('000000001')), {from: web3.eth.accounts[0]}); //, {from: web3.eth.accounts[0]});

    // console.log(res);

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

      await stakeManagerInstance.disputeMove(input.channelId, input.h, sig1, sig2, input.s1, input.s2,
        {from: web3.eth.accounts[0]});

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

    const signedState = await this.signStateMM(hashedState);

    // console.log('Singed by: ', wallet.address);

    conn.send({
      type: 'receive_win_sig',
      state,
      hashedState,
      signedState,
      channelNum,
    });
  },
  async callFastClose(data) {

    console.log(data.channelNum, data.hashedState, data.signedState, data.state);

    const res = await stakeManagerInstance.fastClose(data.channelNum,
        data.hashedState,
        data.signedState,
        utils.bufferToHex(utils.toBuffer(data.state)),
        {from: web3.eth.accounts[0]});

    console.log(res);
        

    stakeManager.MatchOutcome().watch((err, event) => {
      console.log(event, err);
    });
  },
  signBack(data) {
    const hashedState = web3.sha3(this.convertStateToBytes(data));

    const signedState = this.signState(hashedState);

    const msg = {
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
