const dotenv           = require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider-privkey');


const mnemonic = process.env.ETHEREUM_ACCOUNT_MNEMONIC;

module.exports = {
  networks: {
    kovan: {
      provider: function() {
        return new HDWalletProvider(mnemonic, `https://kovan.infura.io/`);
      },
      network_id: '42',
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/');
      },
      network_id: '4',
    },
    test: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'http://127.0.0.1:8545/');
      },
      network_id: '*',
    },
  }

}
