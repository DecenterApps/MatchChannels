const ETHShips = artifacts.require('ETHShips.sol');

module.exports = async (deployer, acc) => {

  deployer.deploy(ETHShips);
}