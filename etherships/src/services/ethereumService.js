import {NUM_BLOCKS_FOR_CHANNEL, DEFAULT_PRICE, ETHERSHIP_ADDRESS} from '../constants/config';
import contract from "truffle-contract";
import Web3 from 'web3';
import EtherShips from '../../build/contracts/EtherShips.json';

export const openChannel = async (markelRoot, webrtcId, signAddress, amount) => {
    let priceInWei = amount === '' ? DEFAULT_PRICE : window.web3.toWei(amount, 'ether');
    let toPay = new window.web3.BigNumber(priceInWei);
    priceInWei = new window.web3.BigNumber(priceInWei);

    let addr = await getCurrAddr();
    const balance = await getUserCtxBalance(addr);
    if (balance.greaterThan(0)) {
        console.log(`User already has ${window.web3.fromWei(balance.toString())} eth on ct`);
        toPay = toPay.minus(balance);
        if (toPay.lessThan(0)) toPay = new window.web3.BigNumber('0');
    }

    return window.ethershipContract.openChannel(
        markelRoot, webrtcId, priceInWei, signAddress, { from: addr, value: toPay });
};


export const joinChannel = async (id, markelRoot, webrtcId, signAddress, amount) => {
    console.log(amount);
    let priceInWei = amount === '' ? DEFAULT_PRICE : amount;
    let toPay = new window.web3.BigNumber(priceInWei);
    priceInWei = new window.web3.BigNumber(priceInWei);

    let addr = await getCurrAddr();
    const balance = await getUserCtxBalance(addr);
    if (balance.greaterThan(0)) {
        console.log(`User already has ${window.web3.fromWei(balance.toString())} eth on ct`);
        toPay = toPay.minus(balance);
        if (toPay.lessThan(0)) toPay = new window.web3.BigNumber('0');
    }

    return window.ethershipContract.joinChannel(id, markelRoot,
        webrtcId, priceInWei, signAddress, {from: addr, value: toPay});
};

export const closeChannel = async (id, sig, numGuesses, shipsInfo) => {
    let addr = await getCurrAddr();

    let { pos, nonces, paths } = shipsInfo;

    console.log('Ships info: ', pos, nonces, paths);

    paths = paths.reduce((a, b) => a.concat(b), []);

    pos = pos.map(p => p + 1);

    console.log(paths);

    const res = await window.ethershipContract.closeChannel(id, sig, numGuesses, paths, pos, nonces, {from: addr});

    return res;
};

export const disputeAnswer = async (channelId, sig, pos, seq, type, nonce, path) => {
    let addr = await getCurrAddr();

    console.log(channelId, sig, pos, seq, type, nonce, path);

    const res = await window.ethershipContract.disputeAnswer(parseInt(channelId, 10), sig, pos, seq, type, nonce, path, {from: addr});

    return res;
};

export const timeout = async (channelId) => {
    let addr = await getCurrAddr();

    const res = await window.ethershipContract.timeout(channelId, {from: addr});

    return res;
};

export const createUser = async (username, price) => {

    const priceInWei = price === '' ? DEFAULT_PRICE : window.web3.toWei(price, 'ether');
    let addr = await getCurrAddr();
    const res = await window.ethershipContract.createAccount(username, {from: addr, value: priceInWei});

    return res;
};

export const fundUser = async (amount) => {
    let addr = await getCurrAddr();

    let weiAmount = window.web3.toWei(amount, 'ether');
    const res = await window.ethershipContract.fundAccount({from: addr, value: weiAmount});

    return res;
};

export const withdraw = async (amount) => {
    let addr = await getCurrAddr();
    let weiAmount = window.web3.toWei(amount, 'ether');

    const res = await window.ethershipContract.withdraw(weiAmount, {from: addr});

    return res;
};

export const getSignerAddress = async (addr) => {
    const res = await window.ethershipContract.signAddresses(addr);

    return res;
}

export const getUserInfo = async (addr) => {
    const user = await window.ethershipContract.players(addr);
    user[1] = window.web3.fromWei(user[1], 'ether');
    return user;
};

// wei balance
export const getUserCtxBalance = async (addr) => {
    const user = await window.ethershipContract.players(addr);
    return user[1];
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
        p1 : channelInfo[0],
        p2 : channelInfo[1],
        stake: channelInfo[2].valueOf(),
        p1root: channelInfo[3],
        p2root: channelInfo[4],
        halfFinisher: channelInfo[5],
        blockStarted: channelInfo[6].valueOf(),
        balance: channelInfo[7].valueOf(),
        p1Score: channelInfo[8].valueOf(),
        p2Score: channelInfo[9].valueOf(),
        finished: channelInfo[10],
        channelId,
    };
};


export const getUserChannels = async (type) =>
    new Promise( async (resolve, reject) => {
        let addr = await getCurrAddr();
        window.ethershipContract[type]({addr: addr}, {fromBlock: 100000,
            toBlock: 'latest'}).get(async (err, res) => {
            if (!err) {
                const channelPromises = res.map(r => getChannelInfo(r.args.channelId.valueOf()));

                const channels = await Promise.all(channelPromises);

                resolve(channels);
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

export const getCurrAddr = async () =>
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

            web3.version.getNetwork(async (err, network) => {

                if (err) {
                    return reject(err);
                }

                if (network !== '42') {
                    return reject("Please switch over to kovan testnet");
                }

                const ethershipContract = contract(EtherShips);
                ethershipContract.setProvider(web3.currentProvider);
                window.ethershipContract = ethershipContract.at(ETHERSHIP_ADDRESS);

                const reg = await getUserInfo(accounts[0]);

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
        });

    } else {
        console.log('No MetaMask - should be handled');
        reject('Please install MetaMask')
    }
});


export const hasOngoingMatch = () => {

};