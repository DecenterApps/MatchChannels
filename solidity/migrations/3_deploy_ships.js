const EtherShips = artifacts.require('EtherShips.sol');

module.exports = async (deployer, acc) => {

  deployer.deploy(EtherShips);
}