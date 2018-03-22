const StakeManager = artifacts.require('StakeManager.sol');
const TicTacResolver = artifacts.require('TicTacToeResolver.sol');

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(StakeManager);
  deployer.deploy(TicTacResolver);
}
