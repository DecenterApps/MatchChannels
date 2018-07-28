const EtherShips = artifacts.require("./EtherShips.sol");

const ethers = require('ethers');

const boardService = require('./helpers/boardService');
const merkle = require('./helpers/merkle');

contract('Ether Ships', async (accounts) => {

  const privateKeys = [
    '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
    '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f',
    '0xdbbe8e4ae425a6d2687f1a7e5ba17bc98c675656790f1b8ad91195c05875ef1',
    '0xc88b705fb08cbea894b6aeff5a544fb92e78a18e19814cd85da85b71f772aa6c',
    '0x588c684foba1ef5017716adb5d21a055ea8e90277d0868557519f97bede61418',
  ];

  let user1, user2, wallet1, wallet2, generatedTree1, generatedTree2, etherShips;

  const board1 = [  0, 0, 0, 0, 0, 0, 1, 0,
                    0, 0, 1, 0, 0, 0, 0, 0, 
                    0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 1, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 1, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 1,
                    0, 0, 0, 0, 0, 0, 0, 0];

  const board2 = [  0, 0, 1, 0, 0, 0, 0, 0,
                    0, 0, 1, 0, 0, 0, 0, 0, 
                    0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 1, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 1, 0,
                    0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 1, 0, 0, 0, 0];

  before(async () => {
    etherShips = await EtherShips.new();

    user1 = accounts[0];
    user2 = accounts[1];

    wallet1 = new ethers.Wallet(privateKeys[2]);
    wallet1.provider = ethers.providers.getDefaultProvider();

    wallet2 = new ethers.Wallet(privateKeys[3]);
    wallet2.provider = ethers.providers.getDefaultProvider();

    await etherShips.createAccount(
      "player1",
      {from: user1, value: 100}
    );
    await etherShips.createAccount(
      "player2",
      {from: user2, value: 100}
    );

    generatedTree1 = await boardService.generateTree(board1);
    generatedTree2 = await boardService.generateTree(board2);

  });

  it('Should close channel if wrong merkleTree', async() => {
      const channelId = 0;
      await etherShips.openChannel(merkle.getRoot(generatedTree1.tree), "0", 10, wallet1.address, {from: user1});
      await etherShips.joinChannel(channelId, merkle.getRoot(generatedTree2.tree), "0", 10,  wallet2.address, {from: user2});

      const pos = 0;
      const type = (board2[pos]+1) % 2; // different from what it should be
      const path = merkle.joinPath(generatedTree2.tree, generatedTree2.hashedBoard, pos);
      const seq = 0;
      const hash = merkle.keccak256(channelId, pos, seq, type, generatedTree2.nonces[pos], "0x" + path.sig);

      const signature = wallet2.signMessage(ethers.utils.arrayify(hash));

      const res = await etherShips.disputeAnswer(
        channelId, // channelId
        signature, //signature
        pos, // _pos
        0, // _seq,
        type, // _type 
        generatedTree2.nonces[pos], // _nonce
        path.path,
        { from: user1}
      );

      assert.equal(res.logs.length, 1, "There must be only one log and it should be CloseChannel");
      // console.log(res.logs); // should log event with close channel
  });

  it('Should fail to close channel if merkleTree is OK', async() => {
    const channelId = 1;
    await etherShips.openChannel(merkle.getRoot(generatedTree1.tree), "0", 10, wallet1.address, {from: user1});
    await etherShips.joinChannel(channelId, merkle.getRoot(generatedTree2.tree), "0", 10,  wallet2.address, {from: user2});

    const pos = 0;
    const type = board2[pos];
    const path = merkle.joinPath(generatedTree2.tree, generatedTree2.hashedBoard, pos);
    const seq = 0;
    const hash = merkle.keccak256(channelId, pos, seq, type, generatedTree2.nonces[pos], "0x" + path.sig);

    const signature = wallet2.signMessage(ethers.utils.arrayify(hash));

    const res = await etherShips.disputeAnswer(
      channelId, // channelId
      signature, //signature
      pos, // _pos
      0, // _seq,
      type, // _type 
      generatedTree2.nonces[pos], // _nonce
      path.path,
      { from: user1}
    );

    assert.equal(res.logs.length, 0, "It shouldn't emit any logs because everything is fine");
  });

  it('Should be able to get money when he submit score', async() => {
    const channelId = 2;
    const stake = 10;
    
    await etherShips.openChannel(merkle.getRoot(generatedTree1.tree), "0", stake, wallet1.address, {from: user1});
    await etherShips.joinChannel(channelId, merkle.getRoot(generatedTree2.tree), "0", stake,  wallet2.address, {from: user2});

    const p1 = await etherShips.players(user1);
    const p1balance = p1[1];

    const numberOfGuesses = 5;
    
    const hash = merkle.keccak256(channelId, user1, numberOfGuesses);
    const signature = wallet2.signMessage(ethers.utils.arrayify(hash));

    const info = await boardService.findShipsPaths(generatedTree1.tree, board1, generatedTree1.nonces);
    let { pos, nonces, paths } = info;

    paths = paths.reduce((a, b) => a.concat(b), []);

    pos = pos.map(p => p + 1);

    const res = await etherShips.closeChannel(
      channelId, // channelId
      signature, //signature
      numberOfGuesses, // _pos
      paths, // paths
      pos, // positions
      nonces, // nonces
      { from: user1}
    );

    const p1new = await etherShips.players(user1);
    const p1balanceNew = p1new[1];

    assert.equal(parseInt(p1balance) + (numberOfGuesses / 10) * (stake*2), p1balanceNew, "Balance should be bigger for one stake same");
  });

  it('Should fail if two same positions are sent', async() => {
    const channelId = 3;
    const stake = 10;
    
    await etherShips.openChannel(merkle.getRoot(generatedTree1.tree), "0", stake, wallet1.address, {from: user1});
    await etherShips.joinChannel(channelId, merkle.getRoot(generatedTree2.tree), "0", stake,  wallet2.address, {from: user2});
    
    const numberOfGuesses = 5;
    
    const hash = merkle.keccak256(channelId, user1, numberOfGuesses);
    const signature = wallet2.signMessage(ethers.utils.arrayify(hash));

    const info = await boardService.findShipsPaths(generatedTree1.tree, board1, generatedTree1.nonces);
    let { pos, nonces, paths } = info;

    paths = paths.reduce((a, b) => a.concat(b), []);

    pos = pos.map(p => p + 1);

    pos[2] = pos[3];

    const res = await etherShips.closeChannel(
      channelId, // channelId
      signature, //signature
      numberOfGuesses, // _pos
      paths, // paths
      pos, // positions
      nonces, // nonces
      { from: user1}
    );
  });
});