import util from 'ethereumjs-util';

import leftPad from 'left-pad';

export const keccak256 = (...args) =>{
    args = args.map(arg => {
      if (typeof arg === 'string') {
        if (arg.substring(0, 2) === '0x') {
            return arg.slice(2)
        } else {
            return window.web3.toHex(arg).slice(2)
        }
      }

      if (typeof arg === 'number') {
        return leftPad((arg).toString(16), 64, 0)
      } else {
        return ''
      }
    })

    args = args.join('')

    return window.web3.sha3(args, { encoding: 'hex' })
}

export const createMerkle = (elements) => {
    const tree = [elements];
     _createMerkle(elements, tree);

     return tree;
  }

function _createMerkle(elements, tree) {
    const lvl2 = [];

    for (let i = 0; i < elements.length - 1; i += 2) {
        lvl2.push(util.bufferToHex(keccak256(elements[i], elements[i + 1])));
    }

    tree.push(lvl2);

    if (lvl2.length === 1) {
        return tree;
    }

    return _createMerkle(lvl2, tree);
}

export const findPath = (tree, elem) => {
      let index = tree[0].findIndex(e => e === elem);

       if (index === -1) {
           console.log('Unable to find the node in a tree');
           return [];
       }

      let path = [tree[0][index]];

    //   if (index % 2 === 0) {
    //     path.push(tree[0][index]);
    //     path.push(tree[0][index+1]);
    //   } else {
    //     path.push(tree[0][index-1]);
    //     path.push(tree[0][index]);
    //   }

    //   index = Math.floor(index / 2);

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

export const joinPath = (merkleTree, elementsHashed, pos)  => {
	const path = findPath(merkleTree, util.bufferToHex(elementsHashed[pos]));

	let sig = "";
	path.forEach((elem) => {
		sig += elem.substring(2);
	});

	return {
        sig,
		path,
	};
};

export const getRoot = tree => tree[tree.length - 1][0];