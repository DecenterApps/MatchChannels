const StakeManager = artifacts.require("./StakeManager.sol");
const TicTacToe = artifacts.require('./TicTacToeResolver.sol');

const util = require('ethereumjs-util');

const advanceToBlock = require('./helpers/advanceToBlock').advanceToBlock;

const ethers = require('ethers');

contract('Stake Manager', async (accounts) => {

  const privateKeys = [
    '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
    '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f',
    '0xdbbe8e4ae425a6d2687f1a7e5ba17bc98c675656790f1b8ad91195c05875ef1',
    '0xc88b705fb08cbea894b6aeff5a544fb92e78a18e19814cd85da85b71f772aa6c',
    '0x588c684foba1ef5017716adb5d21a055ea8e90277d0868557519f97bede61418',
  ];

  let stakeManager, ticTacToe, user1, user2, wallet1, wallet2;

  before(async () => {
    stakeManager = await StakeManager.new();
    ticTacToe = await TicTacToe.new();

    user1 = accounts[0];
    user2 = accounts[1];

    wallet1 = new ethers.Wallet(privateKeys[2]);

    wallet1.provider = ethers.providers.getDefaultProvider();

    wallet2 = new ethers.Wallet(privateKeys[3]);

    await stakeManager.addResolver("TicTacToeResolver", ticTacToe.address);
  });

  it("Should call fast close on a channel, first user got a sig from the second", async () => {
    const openChannel = await stakeManager.openChannel(0, wallet1.address, {from: user1});

    const currChannel = await currentChannel();
    const joinChannel = await stakeManager.joinChannel(currChannel, wallet2.address, {from: user2});

    const state = "000000001"; 
    const hashedState = util.sha3(state);

    const sig = wallet2.signMessage(ethers.utils.arrayify(hashedState));

    const tx = await stakeManager.fastClose(currChannel,
        util.bufferToHex(hashedState),
        sig,
        util.bufferToHex(util.toBuffer(state)),
        {from: user1});


    assert.equal(tx.logs[0].args._winner, accounts[0], "The winner is the first account");
  });

  it("Should call fast close on a channel (with stake), second user got a sig from the first user", async () => {
    const openChannel = await stakeManager.openChannel(0, wallet1.address, {from: user1, value: 40000000});

    const currChannel = await currentChannel();
    const joinChannel = await stakeManager.joinChannel(currChannel, wallet2.address, {from: user2, value: 40000000});

    const state = "000000012"; 
    const hashedState = util.sha3(state);

    const sig = wallet1.signMessage(ethers.utils.arrayify(hashedState));

    const tx = await stakeManager.fastClose(currChannel,
        util.bufferToHex(hashedState),
        sig,
        util.bufferToHex(util.toBuffer(state)),
        {from: user2});


    assert.equal(tx.logs[0].args._winner, accounts[1], "The winner is the second account");
  });


  it("Should make the second user the winner becase he disputed that the other player played an already played field", async () => {

    const openChannel = await stakeManager.openChannel(0, wallet1.address, {from: user1});

    const currChannel = await currentChannel();
    const joinChannel = await stakeManager.joinChannel(currChannel, wallet2.address, {from: user2});

    const state1 = '000020000410';
    const state2 = '000010000420';

    const hashedState1 = util.sha3(state1);
    const hashedState2 = util.sha3(state2);

    const sig1 = wallet1.signMessage(ethers.utils.arrayify(hashedState1));
    const sig2 = wallet1.signMessage(ethers.utils.arrayify(hashedState2));

    const tx = await stakeManager.disputeMove(
        currChannel,
        [util.bufferToHex(hashedState1), util.bufferToHex(hashedState2)],
        sig1,
        sig2,
        util.bufferToHex(util.toBuffer(state1)),
        util.bufferToHex(util.toBuffer(state2)),
        {from: user2});

    assert.equal(tx.logs[1].args._winner, user2);
  });

  it("Should make the second user the winner becase he disputed that the other player played as the wrong player", async () => {

    const openChannel = await stakeManager.openChannel(0, wallet1.address, {from: user1});

    const currChannel = await currentChannel();
    const joinChannel = await stakeManager.joinChannel(currChannel, wallet2.address, {from: user2});

    const state1 = '000020000410';
    const state2 = '000002000520';

    const hashedState1 = util.sha3(state1);
    const hashedState2 = util.sha3(state2);

    const sig1 = wallet1.signMessage(ethers.utils.arrayify(hashedState1));
    const sig2 = wallet1.signMessage(ethers.utils.arrayify(hashedState2));

    const tx = await stakeManager.disputeMove(
        currChannel,
        [util.bufferToHex(hashedState1), util.bufferToHex(hashedState2)],
        sig1,
        sig2,
        util.bufferToHex(util.toBuffer(state1)),
        util.bufferToHex(util.toBuffer(state2)),
        {from: user2});

    assert.equal(tx.logs[1].args._winner, user2);
  });

  it("Should make the first user the winner becase the second player had an invalid dispute", async () => {

    const openChannel = await stakeManager.openChannel(0, wallet1.address, {from: user1});

    const currChannel = await currentChannel();
    const joinChannel = await stakeManager.joinChannel(currChannel, wallet2.address, {from: user2});

    const state1 = '000020000410';
    const state2 = '000001000520';

    const hashedState1 = util.sha3(state1);
    const hashedState2 = util.sha3(state2);

    const sig1 = wallet1.signMessage(ethers.utils.arrayify(hashedState1));
    const sig2 = wallet1.signMessage(ethers.utils.arrayify(hashedState2));

    const tx = await stakeManager.disputeMove(
        currChannel,
        [util.bufferToHex(hashedState1), util.bufferToHex(hashedState2)],
        sig1,
        sig2,
        util.bufferToHex(util.toBuffer(state1)),
        util.bufferToHex(util.toBuffer(state2)),
        {from: user2});

    assert.equal(tx.logs[1].args._winner, user1);
  });

  it('Should FAIL to close a timeouted channel if enough time hasnt passed', async () => {
    const openChannel = await stakeManager.openChannel(0, wallet1.address, {from: user1});

    const currChannel = await currentChannel();
    const joinChannel = await stakeManager.joinChannel(currChannel, wallet2.address, {from: user2});

    try {
      const res = await stakeManager.closeTimeoutedChannel(currChannel);

    } catch(err) {
      assert.isTrue(err.toString().includes('revert'));
    }
  });

  // it('Should close a channel if the max timeout period has run out', async () => {
  //   const openChannel = await stakeManager.openChannel(0, wallet1.address, {from: user1});

  //   const currChannel = await currentChannel();
  //   const joinChannel = await stakeManager.joinChannel(currChannel, wallet2.address, {from: user2});

  //   // mine 501 blocks to simulate a timeout
  //   await advanceToBlock(web3.eth.blockNumber + 501);

  //   try {
  //     const res = await stakeManager.closeTimeoutedChannel(currChannel);

  //     assert.isTrue(true);      
  //   } catch(err) {
  //     assert.isTrue(false);  
  //   }

  // });

  // Helper
  async function currentChannel() {
    const res = await stakeManager.nChannel();

    return res.valueOf() - 1;
  }

});