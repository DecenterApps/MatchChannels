import {NUM_BLOCKS_FOR_CHANNEL, DEFAULT_PRICE, ETHERSHIP_ADDRESS} from '../constants/config';
import contract from "truffle-contract";
import Web3 from 'web3';
import EtherShips from '../../../solidity/build/contracts/EtherShips';

export const openChannel = async (markelRoot, webrtcId, signAddress, amount) => {
    console.log(amount)
    const priceInWei = amount === '' ? DEFAULT_PRICE : window.web3.toWei(amount, 'ether');
    console.log(priceInWei)

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

    let weiAmount = window.web3.toWei(amount, 'ether');
    const res = await window.ethershipContract.fundAccount({from: addr, value: weiAmount});

    return res;
};

export const withdraw = async (amount) => {
    let addr = await getCurrUser();
    let weiAmount = window.web3.toWei(amount, 'ether');

    const res = await window.ethershipContract.withdraw(weiAmount, {from: addr});

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

export const getCurrentBlockNumber = () =>
    new Promise((resolve, reject) => {
        window.web3.eth.getBlockNumber(async (err, blockNum) => {
            if(!err) {   
                resolve(blockNum.valueOf());
            } else {
                reject(err);
            }
        });
    });

export const getChannelInfo = async (channelId) => {
    const channelInfo = await window.ethershipContract.channels(channelId);

    return {
        p1root: channelInfo[3],
		p2root: channelInfo[4],
		finished: channelInfo[8],
    };
};

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

export const getWeb3 = () =>
  new Promise(async (resolve, reject) => {
    var results;
    var web3 = window.web3;

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider.
        web3 = new Web3(web3.currentProvider);

        web3.eth.getAccounts(async (err, accounts) => {
            if (err) return reject(err.message);
            if (!accounts.length) return reject("Please unlock MetaMask");

            let addr = accounts[0];

            const ethershipContract = contract(EtherShips);
            ethershipContract.setProvider(web3.currentProvider);
            window.ethershipContract = ethershipContract.at(ETHERSHIP_ADDRESS);

            const reg = await getUser(accounts[0]);

            const user = {
                userAddr: addr,
                username: reg[0],
                balance: reg[1].valueOf(),
                gamesPlayed: reg[2].valueOf(),
                finishedGames: reg[3].valueOf(),
                registered: reg[4].valueOf()
            };

            resolve(user);
        });

    } else {
        console.log('No MetaMask - should be handled');
        reject('Please install MetaMask')
    }
});
