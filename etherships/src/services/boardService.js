import util from 'ethereumjs-util';
import ethers from 'ethers';

import { createMerkel, keccak256 } from '../util/merkel';

import { getSignerAddress } from './ethereumService';

export const generateTree = (board) => {
    const elements = board.map(((type, i) => ([i, type, getRandomInt(Number.MAX_SAFE_INTEGER)])));
    const elementsHashed = elements.map(e => keccak256(...e));

	const tree = createMerkel(elementsHashed.map(p => util.bufferToHex(p)));

    return { 
        tree,
        nonces: elements.map(e => e[2]),
        hashedBoard: elementsHashed,
    };

}


export const checkGuess = (state, channelId, pos, merkleTree, hashedFields, nonces, currSequence, numOfGuesses, opponentAddress) => {
      const type = (hashedFields[pos] == keccak256(pos, 1, nonces[pos])) ? 1 : 0;
      // numOfGuesses += (hashedFields[pos] == keccak256(pos, 1, nonces[pos])) ? 1 : 0;

	  console.log("hashing sig: ", channelId, opponentAddress, numOfGuesses);


      const path = joinPath(merkleTree, hashedFields, pos);
      const hash = keccak256(parseInt(channelId, 10), pos, currSequence, type, nonces[pos], "0x" + path.sig);
      const hashNumOfGuesses = keccak256(parseInt(channelId, 10), opponentAddress, numOfGuesses);

	  console.log('hash: ', hashNumOfGuesses, " broj kanala: ", channelId);

      const signatureResponse = state.user.userWallet.signMessage(ethers.utils.arrayify(hash));
      const signatureNumOfGuesses = state.user.userWallet.signMessage(ethers.utils.arrayify(hashNumOfGuesses));

      return {
      	signatureResponse,
      	signatureNumOfGuesses,
      	numOfGuesses,
      };
};

// get the result of your opponent, and check sig. and answer
// if the result is wrong format data so we can call the dispute
export const checkResult = (channelId, signedScore, opponentAddress, numOfGuesses) => {
	const msg = keccak256(channelId, opponentAddress, numOfGuesses);
	const {v, r, s} = util.fromRpcSig(signedScore);

	const pubKey  = util.ecrecover(util.toBuffer(msg), v, r, s);
	const addrBuf = util.pubToAddress(pubKey);
	const addr    = util.bufferToHex(addrBuf);

	return (addr == opponentAddress);
};


export const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
}

function joinPath(merkleTree, elementsHashed, pos) {
	const path = findPath(merkleTree, util.bufferToHex(elementsHashed[pos]));

	let sig = "";
	path.forEach((elem) => {
		sig += elem.substring(2);
	});

	return {
		sig,
		path
	};
}


function findPath(tree, elem) {
	let index = tree[0].findIndex(e => e === elem);

	if (index === -1) {
		console.log('Unable to find the node in a tree');
		return;
	}

	let path = [tree[0][index]];

	for (let i = 0; i < tree.length-1; ++i) {          
		if (index % 2 === 0) {
			path.push(tree[i][index+1]);
		} else {
			path.push(tree[i][index-1]);
		}

		index = Math.floor(index / 2);
	}

	return path;
}