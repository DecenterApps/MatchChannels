const Web3 = require('web3');
const ethUtils = require('ethereumjs-util');

require('dotenv').config();

const ethers = require('ethers');

const LOCAL_NETWORK = "http://localhost:9545";
const KOVAN_NETWORK = "https://kovan.decenter.com";

const web3 = new Web3(new Web3.providers.HttpProvider(LOCAL_NETWORK));

const privateKey = Buffer.from(process.env.PRIV_KEY, 'hex');
const ourAddress = process.env.ADDRESS;

const matchChannelAbi = require('./build/contracts/MatchChannels');

const matchChannel = web3.eth.contract(matchChannelAbi.abi).at(process.env.CONTRACT_ADDRESS);

(async () => {

    // basic workflow
    //const user1 = new User(web3, address, privKey);
    //const user2 = new User(web3, address, privKey);

    //const channelId = await user1.createChannel();

    //const opened = await user2.joinChannel(channelId);

    //if (opened) {
    //    user1.sendMsg('msg', value);
    //  user2.on('msg', (signed, value) => {
        //     const valid = user2.storeMsg(signed, value);

        //     if (valid) {
        //         helper.sendAnswer();
        //     } else {
        //         await user2.dispute();
        //     }
        // })
    // }

    testDispute();

})();

function testDispute() {
    const numOfTokens = 12;

    const hashedValue = ethers.utils.solidityKeccak256(['uint'], [numOfTokens]);

    const signature = ethUtils.ecsign(new Buffer(hashedValue.substr(2, hashedValue.length), 'hex'), privateKey);

    const h = ethUtils.bufferToHex(hashedValue);
    const v = signature.v;
    const r = ethUtils.bufferToHex(signature.r);
    const s = ethUtils.bufferToHex(signature.s);

    console.log("Hashed data { amount }: ", h);

    const res = matchChannel.testDispute.call(h, v, r, s, numOfTokens);

    console.log('Signature is valid: ', res);
}
