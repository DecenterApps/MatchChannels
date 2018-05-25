const EtherShips = artifacts.require("./EtherShips.sol");

const util = require('ethereumjs-util');

const advanceToBlock = require('./helpers/advanceToBlock').advanceToBlock;

const ethers = require('ethers');

const MerkleTree = require('merkle-tree-solidity').default;

const leftPad = require('left-pad');

contract('Ether Ships', async (accounts) => {

  const privateKeys = [
    '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
    '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f',
    '0xdbbe8e4ae425a6d2687f1a7e5ba17bc98c675656790f1b8ad91195c05875ef1',
    '0xc88b705fb08cbea894b6aeff5a544fb92e78a18e19814cd85da85b71f772aa6c',
    '0x588c684foba1ef5017716adb5d21a055ea8e90277d0868557519f97bede61418',
  ];

  let stakeManager, user1, user2, user3, wallet1, 
        wallet2, merkleTree1, merkleTree2, elements1, elements2, elements1Hashed, elements2hashed;


  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

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
    user3 = accounts[2];

    wallet1 = new ethers.Wallet(privateKeys[2]);

    wallet1.provider = ethers.providers.getDefaultProvider();

    wallet2 = new ethers.Wallet(privateKeys[3]);

    const res1 = generateMerkel(board1);
    const res2 = generateMerkel(board2);

    merkleTree1 = res1.tree;
    merkleTree2 = res2.tree;

    elements1 = res1.elements;
    elements2 = res2.elements;

    elements1Hashed = res1.elementsHashed;
    elements2Hashed = res2.elementsHashed;

  });

  function createMerkel(elements) {
    const tree = [elements];
     _createMerkel(elements, tree);

     return tree;
  }

  function _createMerkel(elements, tree) {
    const lvl2 = [];

    for (let i = 0; i < elements.length - 1; i += 2) {
        lvl2.push(util.bufferToHex(keccak256(elements[i], elements[i + 1])));
    }

    tree.push(lvl2);

    if (lvl2.length === 1) {
        return tree;
    }

    return _createMerkel(lvl2, tree);
  }

  function findPath(tree, elem) {
      let index = tree[0].findIndex(e => e === elem);

       if (index === -1) {
           console.log('Unable to find the node in a tree');
           return;
       }

      let path = [tree[0][index]];

      for (let i = 1; i < tree.length; ++i) {
          index = Math.floor(index / 2);
          path.push(tree[i][index]);
      }

      return path;
  }

  function keccak256(...args) {
      args = args.map(arg => {
        if (typeof arg === 'string') {
          if (arg.substring(0, 2) === '0x') {
              return arg.slice(2)
          } else {
              return web3.toHex(arg).slice(2)
          }
        }

        if (typeof arg === 'number') {
          return leftPad((arg).toString(16), 64, 0)
        } else {
          return ''
        }
      })

      args = args.join('')

      return web3.sha3(args, { encoding: 'hex' })
    }

  const getRoot = tree => tree[tree.length - 1][0];

  function generateMerkel(board) {
    const elements = board.map(((type, i) => ([i, type, getRandomInt(Number.MAX_SAFE_INTEGER)])));
    const elementsHashed = elements.map(e => keccak256(...e));

    const tree = createMerkel(elementsHashed.map(p => util.bufferToHex(p)));

    return { 
        tree,
        elements,
        elementsHashed,
    };

  }

  it("Calls close channel, user1 challanges user2", async () => {

    await etherShips.openChannel(wallet1.address, getRoot(merkleTree1), {from: user1});
    await etherShips.joinChannel(0, wallet2.address, getRoot(merkleTree2), {from: user2});

    const ELEMENT_POS = 0;

    // get user 2 merkel path

    const path = findPath(merkleTree2, util.bufferToHex(elements2Hashed[ELEMENT_POS]));

    console.log(merkleTree2);

    let sig = ""; 
    path.forEach((elem) => {
        sig += elem.substring(2);
    });

    const hash = keccak256(ELEMENT_POS, 0, elements2[0][0], elements2[0][2], 5, 5);

    console.log(hash, user2);

    const signature = wallet2.signMessage(ethers.utils.arrayify(hash));

    const res = await etherShips.closeChannel(
        0, // channelId
        signature, //signature
        ELEMENT_POS, // _pos
        0, // _seq,
        elements2[0][0], // _type
        elements2[0][2], // _nonce
        5, // _hp
        5, // _ap
        path,
        { from: user1}
    );

    console.log(res.logs[0]);

  });

});