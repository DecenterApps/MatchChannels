# Etherships

## Overview

Etherships is a 1v1 peer-to-peer game based on the classic guessing game Battleships that runs on the Ethereum blockchain and uses state channels to minimize its number of interactions with the blockchain. It was created as a PoC of using state channels to create blockchain powered games.

Having initially set out to create a new state channels framework that anyone could use to create their own games, we soon realized the sheer number of challenges we would need to overcome. First we came across the issue of different types of scoring systems in games, followed by the problem of sharing data that needed to remain secret between players. Then there was the need to absolutely minimize the amount of data that would have to be stored on the blockchain and finally there was a lack of any existing framework or tooliing for implementing state channels or using WebRTC for P2P communication.

## Build procedure

Code consists of 2 main parts the solidity code located in /solidity folder and the library code located in /library.

To run the smart contract run `truffle develop` (you'll need the latest version of truffle installed)

In the `truffle develop` console run `migrate --reset` to compile and deploy the contracts to local testnet.

To deploy on the kovan testnet run `migrate --network=kovan --reset`

In order to run tests first run `yarn install` or `npm install` and then `test` in truffle develop console.

To run the the whole game, just run from etherships folder:

* `yarn install` or `npm install`
* `yarn dev` or `npm run dev`

## Contracts

* EtherShips (Main contract, used for opening, joining channels and also disputing game)
* Player (contract that handles stuff for player, ability to fund account or withdraw your money)
* ECTools (utility contract for signature verification)

## Frontend

In the spirit of decentralization we also decided not to use a server for communication between users and instead create a direct connection using the WebRTC protocol. WebRTC has been supported by all major browsers for more than a few years now and it seemed to fit the project great. Although, it’s not completely server-less and you still need a so called ICE/TURN server to connect the 2 users, but, after that, all communication is direct. 

Beside that we didn't want to make you sign all the messages via Metamask for each move, so we create new wallets for you for each game with Ether.js. You send that one-time address when you are opening or joining channel and we always check if it's signed with that address, while your main address from metamask is used as your ID for everything else.

## Behind the scenes

We are using a so-called commit-reveal scheme, where each side has all their board’s squares hashed with a random number (nonce) and then sent to the other player, so its not possible (at least not easily possible) to find where are opponent ships. Then each user makes merkle tree of his hashes and send merkle root to contract when opening/joining channel. When one user guesses a field, other user reveals a nonce for that field and type (type is 0 if there is no ship, and 1 if there is) and send that signed with merkle path and also other user signs opponents number of guesses. If there is a mismatch with merkle root, other user is able to dispute and get everything from contract. Also at any time, user can close channel with his number of guesses and get `numberOfGuesses / 10 * channelBalance`.

## Want to read more?
We wrote article about this, if you want to read more, go to:
[Introducing Etherships – Using state channels to scale Ethereum games](https://blog.decenter.com/2018/08/07/introducing-etherships-using-state-channels-scale-ethereum-games/)

Contact us at info@decenter.com
