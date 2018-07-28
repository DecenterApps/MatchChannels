import util from 'ethereumjs-util';
import ethers from 'ethers';

import { createMerkle, keccak256, findPath, joinPath } from './merkle';

//TODO: check if we need channelId in board element
export const generateTree = (board) => {
    const elements = board.map(((type, i) => ([i, type, getRandomInt(Number.MAX_SAFE_INTEGER)])));
    const elementsHashed = elements.map(e => keccak256(...e));

	const tree = createMerkle(elementsHashed.map(p => util.bufferToHex(p)));

    return { 
        tree,
        nonces: elements.map(e => e[2]),
        hashedBoard: elementsHashed,
    };
};

export const checkGuess = (state, pos, numOfGuesses) => {
	  const { opponentChannel, opponentAddr } = state.user;
	  const { tree, hashedBoard, nonces, sequence } = state.board;

	  let type = (hashedBoard[pos] === keccak256(pos, 1, nonces[pos])) ? 1 : 0;
	  
	  const path = joinPath(tree, hashedBoard, pos);
	  const hash = keccak256(parseInt(opponentChannel, 10), parseInt(pos, 10), 
	  parseInt(sequence, 10), parseInt(type, 10), parseInt(nonces[pos], 10), "0x" + path.sig);

	  const hashNumOfGuesses = keccak256(parseInt(opponentChannel, 10), opponentAddr, numOfGuesses);

      const signatureResponse = state.user.userWallet.wallet.signMessage(ethers.utils.arrayify(hash));
      const signatureNumOfGuesses = state.user.userWallet.wallet.signMessage(ethers.utils.arrayify(hashNumOfGuesses));

      return {
      	signatureNumOfGuesses,
		numOfGuesses,
		disputeData: {
			channelId: opponentChannel,
			signatureResponse,
			nonce: nonces[pos],
			path: path.path,
			type,
			sequence,
		}
      };
};

export const checkMerklePath = (opponentTree, pos, isHit, nonce) => {
	const elem = keccak256(pos, isHit ? 1 : 0, nonce);

	const path = findPath(opponentTree, elem);

	return path.length === 0 ? false : true;
};

export const findShipsPaths = (tree, board, nonces) => {
	const positions = [];

	for(let i = 0; i < board.length; ++i) {
		if (board[i] === 1 || board[i] === 3) {
			positions.push(i);
		}
	}

	const myNonces = [];

	for(let i = 0; i < 5; ++i) {
		myNonces.push(nonces[positions[i]]);
	}

	const paths = [];

	for(let i = 0; i < 5; ++i) {
		paths.push(findPath(tree, tree[0][positions[i]]));
	}

	return {
		pos: positions,
		nonces: myNonces,
		paths,
	}

}


export const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
};
