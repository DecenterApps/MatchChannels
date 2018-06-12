import { NUM_BLOCKS_FOR_CHANNEL, DEFAULT_PRICE } from '../constants/config';


export const openChannel = async (markelRoot, webrtcId, signAddress) => {
    const res = await window.ethershipContract.openChannel(
        markelRoot, webrtcId, DEFAULT_PRICE, signAddress, {from: window.account, value: DEFAULT_PRICE});

    return res;
};


export const joinChannel = async (id, markelRoot, webrtcId, signAddress) => {
    const res = await window.ethershipContract.joinChannel(id, markelRoot,
         webrtcId, DEFAULT_PRICE,  signAddress, {from: window.account, value: DEFAULT_PRICE});

    return res;
};

export const createUser = async (username, price) => {
    console.log('username: ', username, 'price: ', price);

    const priceInWei = price === '' ? DEFAULT_PRICE : window.web3.toWei(price, 'ether');

    const res = await window.ethershipContract.createAccount(username, { from: window.account, value: priceInWei});

    return res;
};

export const fundUser = async (amount) => {
    const res = await window.ethershipContract.fundAccount({from: window.account, value: amount});

    return res;
};

export const withdraw = async (amount) => {
    const res = await window.ethershipContract.withdraw({from: window.account, value: amount});

    return res;
};

export const getUser = async (addr) => {
    const isReg = await window.ethershipContract.players(addr);

    return isReg;
}

export const getOpenChannels = async () => 
    new Promise((resolve, reject) => {
        window.web3.eth.getBlockNumber((err, blockNum) => {
            if(!err) {                
                window.ethershipContract.OpenChannel({}, { fromBlock: blockNum.valueOf() -  NUM_BLOCKS_FOR_CHANNEL, toBlock: 'latest' }).get((err, res) => {
                    if(!err) {
                        resolve(res);
                    } else {
                        reject(err);
                    }
                });
            }
        });
    });

