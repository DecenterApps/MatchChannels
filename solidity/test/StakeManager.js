const StakeManager = artifacts.require("./StakeManager.sol");
const TicTacToe = artifacts.require('./TicTacToeResolver.sol');

const util = require('ethereumjs-util');

contract('Stake Manager', async (accounts) => {

  const privateKeys = [
    '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
    '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f',
    '0xdbbe8e4ae425a6d2687f1a7e5ba17bc98c675656790f1b8ad91195c05875ef1',
    '0xc88b705fb08cbea894b6aeff5a544fb92e78a18e19814cd85da85b71f772aa6c',
    '0x588c684foba1ef5017716adb5d21a055ea8e90277d0868557519f97bede61418',
  ];

  let stakeManager, ticTacToe, user1, user2;

  before(async () => {
    stakeManager = await StakeManager.new();
    ticTacToe = await TicTacToe.new();

    user1 = accounts[0];
    user2 = accounts[1];

    await stakeManager.addResolver("TicTacToeResolver", ticTacToe.address);
  });

  it("Closing a channel", async () => {

    const openChannel = await stakeManager.openChannel(0, user1, {from: user1});
    const joinChannel = await stakeManager.joinChannel(0, user2, {from: user2});

    const state1 = '000020000410';//'0x1112000000'
    const state2 = '000021000520';
                   // 000021000520

    const hashedState1 = util.sha3(state1);
    const hashedState2 = util.sha3(state2);

    console.log('Address of first user: ', user1, 'Address of seconds user: ', user2);

    const sig1 = util.ecsign(hashedState1, util.toBuffer(privateKeys[0]));
    const sig2 = util.ecsign(hashedState2, util.toBuffer(privateKeys[1]));

   
        const tx = await stakeManager.disputeMove(
        0,
        [util.bufferToHex(hashedState1), util.bufferToHex(hashedState2)],
        [util.bufferToInt(sig1.v), util.bufferToInt(sig2.v)],
        [util.bufferToHex(sig1.r), util.bufferToHex(sig2.r)],
        [util.bufferToHex(sig1.s), util.bufferToHex(sig2.s)],
        util.bufferToHex(util.toBuffer(state1)),
        util.bufferToHex(util.toBuffer(state2)),
        {from: user1});

        console.log(tx);
        

        const channel = await stakeManager.channels(0);

        console.log(channel);

        // const resolve = await ticTacToe.resolve(util.bufferToHex(util.toBuffer(state1)), util.bufferToHex(util.toBuffer(state2)), {from: user1});

        // console.log(resolve[0]*1, resolve[1]*1);

  });

  it("Calling fast close on a channel", async () => {
    const openChannel = await stakeManager.openChannel(0, accounts[0], {from: user1});
    const joinChannel = await stakeManager.joinChannel(1, accounts[1], {from: user2});

    const state = "000000022"; 
    const hashedState = util.sha3(state);

    const sig = util.ecsign(hashedState, util.toBuffer(privateKeys[0]));

    const tx = await stakeManager.fastClose(1,
        util.bufferToHex(hashedState),
        util.bufferToInt(sig.v),
        util.bufferToHex(sig.r),
        util.bufferToHex(sig.s),
        util.bufferToHex(util.toBuffer(state)),
        {from: accounts[1]});

        console.log(accounts[1], tx.logs[0].args.signer, accounts[0], tx.logs[0].args.opponent);

        const channel = await stakeManager.channels(1);

        //console.log(channel);
  });



});