import util from 'ethereumjs-util';

import { createMerkel, keccak256 } from '../util/merkel';

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

// sign what position you want to choose from your opponent
export const pickMove = (pos) => {

};

// get the result of your opponent, and check sig. and answer
export const checkResult = (response) => {

};

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}