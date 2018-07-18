pragma solidity ^0.4.24;

import "./ECTools.sol";
import "./Players.sol";

// board is 8x8
contract EtherShips is Players, ECTools {

	struct Channel {
		address p1;
		address p2;
		uint stake;
		bytes32 p1root;
		bytes32 p2root;
		address halfFinisher;
		uint timeStarted;
		uint p1Score;
		uint p2Score;
		bool finished;

	}

	event OpenChannel(uint channelId, bytes32 root, string webrtcId, uint amount, string username, address indexed addr);
	event JoinChannel(uint channelId, bytes32 root, string webrtcId, uint amount, address indexed addr);
	event CloseChannel(uint channelId, address player, bool finished);

	event Log(address addr1, address addr2, bytes32 hash);

	Channel[] public channels;
	mapping(address => address) public signAddresses;

	uint TIMEOUT_PERIOD = 2 days;

	function openChannel(bytes32 _merkleRoot, string _webrtcId, uint _amount, address _signAddress) payable public {
		require(players[msg.sender].exists);
		require(_amount <= players[msg.sender].balance + msg.value);

		if (msg.value > 0) {
			players[msg.sender].balance += msg.value;
		}

		uint _channelId = channels.length;
        channels.length++;

        signAddresses[msg.sender] = _signAddress;

        players[msg.sender].balance -= _amount;
        Channel storage c = channels[_channelId];
		c.p1 = msg.sender;
		c.stake = _amount;
		c.p1root = _merkleRoot;
		c.timeStarted = now;

        emit OpenChannel(_channelId, _merkleRoot, _webrtcId, _amount, players[msg.sender].username, msg.sender);
    }
    
    function joinChannel(uint _channelId, bytes32 _merkleRoot, string _webrtcId, uint _amount, address _signAddress) payable public {
    	require(_channelId < channels.length);
		require((channels[_channelId].p1 != 0x0) && (channels[_channelId].p2 == 0x0));
		require(players[msg.sender].exists);
		require(_amount <= players[msg.sender].balance + msg.value);

		if (msg.value > 0) {
			players[msg.sender].balance += msg.value;
		}

		signAddresses[msg.sender] = _signAddress;

		Channel storage c = channels[_channelId];
		
		require(c.stake <= _amount);

		c.p2 = msg.sender;
		c.p2root = _merkleRoot;
		c.timeStarted = now;

		// update player stats
		players[msg.sender].balance -= _amount;
		players[c.p1].gamesPlayed += 1;
		players[c.p2].gamesPlayed += 1;

        emit JoinChannel(_channelId, _merkleRoot, _webrtcId, _amount, msg.sender);
    }

    function closeChannel(uint _channelId, bytes _sig, uint _numberOfGuesses) public {
		Channel memory c = channels[_channelId];

		require(c.p1 == msg.sender || c.p2 == msg.sender);
    	require(!c.finished);
    	require(msg.sender != c.halfFinisher);
    	
    	address opponent = c.p1 == msg.sender ? c.p2 : c.p1;
    	bytes32 hash = keccak256(abi.encodePacked(_channelId, msg.sender, _numberOfGuesses));

		emit Log(_recoverSig(hash, _sig), signAddresses[opponent], hash);

       	require(_recoverSig(hash, _sig) == signAddresses[opponent]);

    	if (c.halfFinisher != address(0)) {
    		// one player already submitted score
    		c.finished = true;
    		if (msg.sender == c.p1) {
				c.p1Score = _numberOfGuesses;
			} else {
				c.p2Score = _numberOfGuesses;
			}

			players[msg.sender].balance += c.stake * _numberOfGuesses / 5;

			if (c.p1Score == 5 || c.p2Score == 5) {
				players[c.p1].finishedGames += 1;
				players[c.p2].finishedGames += 1;

				// if game ended we send rest of stake to winner
				if (c.p1Score == 5) {
					players[c.p1].balance += c.stake * (5 - c.p2Score) / 5;
				} else {
					players[c.p2].balance += c.stake * (5 - c.p1Score) / 5;
				}
			}
			// nobody has won the game distribute the rest of the money accordingly
			else {
				players[c.p1].balance += c.stake * (5 - c.p2Score) / 5;
				players[c.p2].balance += c.stake * (5 - c.p1Score) / 5;
			}
    	} else {
    		// other player still didn't answer
			c.halfFinisher = msg.sender;
			if (msg.sender == c.p1) {
				c.p1Score = _numberOfGuesses;
			} else {
				c.p2Score = _numberOfGuesses;
			}

			players[msg.sender].balance += c.stake * _numberOfGuesses / 5;
    	}

    	emit CloseChannel(_channelId, msg.sender, c.finished);
    }

	function timeout(uint _channelId) public {
		Channel memory c = channels[_channelId];

		require(c.p1 == msg.sender || c.p2 == msg.sender);
		require(now > (c.timeStarted + TIMEOUT_PERIOD));
		require(!c.finished);

		// If nobody joined the channel let the user retreive the money
		if (c.p2 == 0x0) {
			players[c.p1].balance += c.stake;
			c.finished = true;
		} 
		// If one of the players hasn't closed the game
		else if (c.halfFinisher != 0x0) {
			uint score = c.halfFinisher == c.p1 ? c.p1Score : c.p2Score;
			uint oneHit = c.stake / 5;

			// the user gets all the left over money in the channel
			players[c.halfFinisher].balance += oneHit * (10 - score);
			c.finished = true;
		}
	}


    function disputeAnswer(uint _channelId, bytes _sig, uint _pos, uint _seq, uint _type, uint _nonce, bytes32[7] _path) public {
    	require(channels[_channelId].p1 == msg.sender || channels[_channelId].p2 == msg.sender);
    	require(!channels[_channelId].finished);

    	address opponent = channels[_channelId].p1 == msg.sender ? channels[_channelId].p2 : channels[_channelId].p1;
		
    	bytes32 hash = keccak256(abi.encodePacked(_channelId, _pos, _seq, _type, _nonce, _path));
    	require(_recoverSig(hash, _sig) == signAddresses[opponent]);

    	bytes32 opponentRoot = channels[_channelId].p1 == msg.sender ? channels[_channelId].p2root : channels[_channelId].p1root;
    	if (keccak256(abi.encodePacked(_pos, _type, _nonce)) != _path[0] || _getRoot(_path) != opponentRoot) {
    		// only player that didn't cheat get plus one on finished games
    		players[msg.sender].finishedGames += 1;
    		players[msg.sender].balance += channels[_channelId].stake * 2;
    		
    		channels[_channelId].p1Score = channels[_channelId].p1 == msg.sender ? 5 : 0;
    		channels[_channelId].p2Score = channels[_channelId].p2 == msg.sender ? 5 : 0;
    		channels[_channelId].finished == true;

    		emit CloseChannel(_channelId, msg.sender, true);
    	}
    }

    function _recoverSig(bytes32 _hash, bytes _sig) private pure returns (address) {

		return prefixedRecover(_hash, _sig);
	}

	function _getRoot(bytes32[7] _path) private pure returns(bytes32 _root) {
	    _root = _path[0];
	    
	    for (uint i=1; i<7; i++) {
	        _root = keccak256(abi.encodePacked(_root, _path[i]));
	    }
    }
}