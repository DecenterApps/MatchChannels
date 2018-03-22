const StakeManager = artifacts.require('StakeManager.sol');
const TicTacResolver = artifacts.require('TicTacToeResolver.sol');

module.exports = async (deployer, acc) => {
  // deployment steps
  deployer.deploy(StakeManager);
  //const stakeManager = await StakeManager.deployed();

  deployer.deploy(TicTacResolver);
  //const tictactoeResolver = await TicTacResolver.deployed();

  //await stakeManager.addResolver("TicTacToeResolver", TicTacResolver.address);
}
