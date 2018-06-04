import { NUM_BLOCKS_FOR_CHANNEL } from '../constants/config';


export const openChannel = async (markelRoot, webrtcId) => {
    console.log(markelRoot, webrtcId, {from: window.account});

    const res = await window.contractInstance.openChannel(markelRoot, webrtcId, {from: window.account});

    return res;
}


export const joinChannel = async (id, markelRoot, webrtcId) => {
    const res = await window.contractInstance.joinChannel(id, markelRoot, webrtcId, {from: window.account});

    return res;
}

export const getOpenChannels = async () => 
    new Promise((resolve, reject) => {
        window.web3.eth.getBlockNumber((err, blockNum) => {
            if(!err) {
                window.contractInstance.OpenChannel({}, { fromBlock: blockNum.valueOf() -  NUM_BLOCKS_FOR_CHANNEL, toBlock: 'latest' }).get((err, res) => {
                    if(!err) {
                        resolve(res);
                    } else {
                        reject(err);
                    }
                });
            }
        });
    });

