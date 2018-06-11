import store from '../../store';
import Web3 from 'web3';

import contract from 'truffle-contract';
import EtherShips from '../../../../solidity/build/contracts/EtherShips';
import { getUser } from '../../services/ethereumService';

import { ETHERSHIP_ADDRESS } from '../../constants/config';

import { WEB3_INITIALIZED, IS_REGISTERED } from '../../constants/actionTypes';

function web3Initialized(results) {
  return {
    type: WEB3_INITIALIZED,
    payload: results
  }
}

function isRegistered(results) {
  return {
    type: IS_REGISTERED,
    payload: results
  }
}

let getWeb3 = new Promise(async (resolve, reject) => {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', async (dispatch)  =>{
    var results
    var web3 = window.web3

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      web3 = new Web3(web3.currentProvider)

      results = {
        web3Instance: web3
      }

      web3.eth.getAccounts(async (err, accounts) => {
        window.account = accounts[0];

        const ethershipContract = contract(EtherShips);
        ethershipContract.setProvider(web3.currentProvider);
        window.ethershipContract = ethershipContract.at(ETHERSHIP_ADDRESS);

        const reg = await getUser(accounts[0]);

        console.log('reg', reg);

        const user = {
          username: reg[0],
          balance: reg[1].valueOf(),
          gamesPlayed: reg[2].valueOf(),
          finishedGames: reg[3].valueOf(),
          exists: reg[4].valueOf()
        };

        if (user.exists) {
          store.dispatch(isRegistered(user));
        }
  
        resolve(store.dispatch(web3Initialized(results)));
      });

    } else {

      // Fallback to localhost if no web3 injection. We've configured this to
      // use the development console's port by default.
      var provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545')

      web3 = new Web3(provider)

      results = {
        web3Instance: web3
      }

      console.log('No web3 instance injected, using Local web3.');

      resolve(store.dispatch(web3Initialized(results)))
    }
  })
})

export default getWeb3
