const EtherShipsV2 = artifacts.require('EtherShipsV2.sol');

module.exports = async (deployer, acc) => {

  deployer.deploy(EtherShipsV2);
}