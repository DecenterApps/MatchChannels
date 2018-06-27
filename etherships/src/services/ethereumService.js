import {NUM_BLOCKS_FOR_CHANNEL, DEFAULT_PRICE, ETHERSHIP_ADDRESS} from '../constants/config';
import {WEB3_INITIALIZED, SET_ADDR, IS_REGISTERED} from "../constants/actionTypes";
import store from "../store";
import contract from "truffle-contract";
import Web3 from 'web3';
import EtherShips from '../../../solidity/build/contracts/EtherShips';


export const openChannel = async (markelRoot, webrtcId, signAddress, amount) => {
    const priceInWei = amount === '' ? DEFAULT_PRICE : window.web3.toWei(amount, 'ether');

    let addr = await getCurrUser();
    const res = await window.ethershipContract.openChannel(
        markelRoot, webrtcId, priceInWei, signAddress, {from: addr, value: priceInWei});

    return res;
};


export const joinChannel = async (id, markelRoot, webrtcId, signAddress, amount) => {
    const priceInWei = amount === '' ? DEFAULT_PRICE : amount;
    let addr = await getCurrUser();
    const res = await window.ethershipContract.joinChannel(id, markelRoot,
        webrtcId, priceInWei, signAddress, {from: addr, value: priceInWei});

    return res;
};

export const closeChannel = async (id, sig, numGuesses) => {
    let addr = await getCurrUser();
    const res = await window.ethershipContract.closeChannel(id, sig, numGuesses, {from: addr});

    return res;
};

export const createUser = async (username, price) => {

    const priceInWei = price === '' ? DEFAULT_PRICE : window.web3.toWei(price, 'ether');
    let addr = await getCurrUser();
    const res = await window.ethershipContract.createAccount(username, {from: addr, value: priceInWei});

    return res;
};

export const fundUser = async (amount) => {
    let addr = await getCurrUser();
    const res = await window.ethershipContract.fundAccount({from: addr, value: amount});

    return res;
};

export const withdraw = async (amount) => {
    let addr = await getCurrUser();
    const res = await window.ethershipContract.withdraw({from: addr, value: amount});

    return res;
};

export const getSignerAddress = async (addr) => {
    const res = await window.ethershipContract.signAddresses(addr);

    return res;
}

export const getUser = async (addr) => {
    const user = await window.ethershipContract.players(addr);

    user[1] = window.web3.fromWei(user[1], 'ether');

    return user;
};

export const getJoinedChannels = async (blockNum) =>
    new Promise((resolve, reject) => {
        window.ethershipContract.JoinChannel({}, {
            fromBlock: blockNum.valueOf() - NUM_BLOCKS_FOR_CHANNEL,
            toBlock: 'latest'
        }).get((err, res) => {
            if (!err) {
                resolve(res);
            } else {
                reject(err);
            }
        });
    });

// list all the channels that are recent and that are open for users to join
export const getActiveChannels = async () =>
    new Promise((resolve, reject) => {
        window.web3.eth.getBlockNumber(async (err, blockNum) => {
            if (!err) {
                window.ethershipContract.OpenChannel({}, {
                    fromBlock: blockNum.valueOf() - NUM_BLOCKS_FOR_CHANNEL,
                    toBlock: 'latest'
                }).get(async (err, res) => {

                    const joinedChannels = await getJoinedChannels(blockNum);

                    const channelIds = joinedChannels.map(c => c.args.channelId.valueOf());

                    if (!err) {
                        const matches = res.filter(r => {
                            if (channelIds.includes(r.args.channelId.valueOf())) {
                                return false;
                            } else {
                                return true;
                            }
                        });

                        resolve(matches);
                    } else {
                        reject(err);
                    }
                });
            }
        });
    });

export const getCurrUser = async () =>
    new Promise((resolve, reject) => {
        window.web3.eth.getAccounts(async (err, accounts) => {
            resolve(accounts[0]);
        });
    });

export const getWeb3 = new Promise(async (resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', async (dispatch) => {
        var results;
        var web3 = window.web3;

        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof web3 !== 'undefined') {
            // Use Mist/MetaMask's provider.
            web3 = new Web3(web3.currentProvider);

            results = {
                web3Instance: web3
            };

            web3.eth.getAccounts(async (err, accounts) => {
                let addr = accounts[0];
                store.dispatch({ type: SET_ADDR, payload: {addr} });

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
            var provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');

            web3 = new Web3(provider)

            results = {
                web3Instance: web3
            }

            console.log('No web3 instance injected, using Local web3.');

            resolve(store.dispatch(web3Initialized(results)))
        }
    })
})

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

