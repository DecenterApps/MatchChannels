const StakeManager = artifacts.require('StakeManager.sol');
const TicTacResolver = artifacts.require('TicTacToeResolver.sol');
const ECTools = artifacts.require('ECTools.sol');

module.exports = async (deployer, acc) => {
  // deployment steps
  let stakeManager, ticTacToeResolver;

  deployer.then(() => {
    return StakeManager.new();
  }).then(instance => {
    stakeManager = instance;

    return TicTacResolver.new();
  }).then(instance => {
    ticTacToeResolver = instance;

    return stakeManager.addResolver("TicTacToeResolver", ticTacToeResolver.address);
  }).then(() => {
    console.log(`StakeManager: ${stakeManager.address}`);
    console.log(`TicTacToeResolver: ${ticTacToeResolver.address}`);

    return true;
  })
}
