# MatchChannels

## Overview

A generalized state channel implementation for 1 on 1 communication and state resolvement.

This is a state channel implementation focused primarily on games but can be used for any direct state resolving between 2 participants.

The framework is generalized and extendable allowing users to integrate it with their own systems, both the smart contracts and a frontend library to interface with them is provided.

## Build procedure

Code consists of 2 main parts the solidity code located in /solidity folder and the library code located in /library.

To run the smart contract, navigate to /solidity and run `truffle develop` (you'll need the latest version of truffle installed)

In the `truffle develop` console run `migrate --reset` to compile and deploy the contracts to local testnet.
To deploy on the kovan testnet run `migrate --network kovan --reset`

In order to run tests first run `yarn install` or `npm install` and then `test` in truffle develop console.

To run the frontend library code, navigate to /library folde and run the following:

* `yarn install` or `npm install`
* `yarn dev` or `npm run dev`

## Contracts

* StakeManager (holds your stake and creates a channel for 2 users)
* ResolverInterface (an interface for resolver contracts to handle state disputes)
* CfResolverRegistry (counter factual registry and creation of resolver contracts)
* TicTacToeResolver (an example of a resolver that handles the state of a tic tac toe game)
* ECTools (utility contract for signature verification)

