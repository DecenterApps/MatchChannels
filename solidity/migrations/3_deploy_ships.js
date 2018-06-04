const EtherShips = artifacts.require('EtherShips.v2.sol');

module.exports = async (deployer, acc) => {

  deployer.deploy(EtherShips);
}