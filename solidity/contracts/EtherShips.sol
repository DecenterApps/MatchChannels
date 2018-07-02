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
		uint p1Score;
		uint p2Score;
		address halfFinisher;
		bool finished;
	}

	event OpenChannel(uint channelId, bytes32 root, string webrtcId, uint amount, string username, address addr);
	event JoinChannel(uint channelId, bytes32 root, string webrtcId, uint amount);
	event CloseChannel(uint channelId, address player, bool finished);

	event Log(address addr1, address addr2, bytes32 hash);

	Channel[] public channels;
	mapping(address => address) public signAddresses;

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

		// update player stats
		players[msg.sender].balance -= _amount;
		players[c.p1].gamesPlayed += 1;
		players[c.p2].gamesPlayed += 1;

        emit JoinChannel(_channelId, _merkleRoot, _webrtcId, _amount);
    }

    function closeChannel(uint _channelId, bytes _sig, uint _numberOfGuesses) public {
		require(channels[_channelId].p1 == msg.sender || channels[_channelId].p2 == msg.sender);
    	require(!channels[_channelId].finished);
    	require(msg.sender != channels[_channelId].halfFinisher);
    	
    	address opponent = channels[_channelId].p1 == msg.sender ? channels[_channelId].p2 : channels[_channelId].p1;
    	bytes32 hash = keccak256(abi.encodePacked(_channelId, msg.sender, _numberOfGuesses));

//		emit Log(_recoverSig(hash, _sig), signAddresses[opponent], hash);

       	require(_recoverSig(hash, _sig) == signAddresses[opponent]);

    	if (channels[_channelId].halfFinisher != address(0)) {
    		// one player already submitted score
    		channels[_channelId].finished = true;
    		if (msg.sender == channels[_channelId].p1) {
				channels[_channelId].p1Score = _numberOfGuesses;
			} else {
				channels[_channelId].p2Score = _numberOfGuesses;
			}

			players[msg.sender].balance += channels[_channelId].stake * _numberOfGuesses / 5;

			if (channels[_channelId].p1Score == 5 || channels[_channelId].p2Score == 5) {
				players[channels[_channelId].p1].finishedGames += 1;
				players[channels[_channelId].p2].finishedGames += 1;

				// if game ended we send rest of stake to winner
				if (channels[_channelId].p1Score == 5) {
					players[channels[_channelId].p1].balance += channels[_channelId].stake * (5 - channels[_channelId].p2Score) / 5;
				} else {
					players[channels[_channelId].p2].balance += channels[_channelId].stake * (5 - channels[_channelId].p1Score) / 5;
				}
			}
    	} else {
    		// other player still didn't answer
			channels[_channelId].halfFinisher = msg.sender;
			if (msg.sender == channels[_channelId].p1) {
				channels[_channelId].p1Score = _numberOfGuesses;
			} else {
				channels[_channelId].p2Score = _numberOfGuesses;
			}

			players[msg.sender].balance += channels[_channelId].stake * _numberOfGuesses / 5;
    	}

    	emit CloseChannel(_channelId, msg.sender, channels[_channelId].finished);
    }


    function disputeAnswer(uint _channelId, bytes _sig, uint _pos, uint _seq, uint _type, uint _nonce, bytes32[7] _path) public {
    	require(channels[_channelId].p1 == msg.sender || channels[_channelId].p2 == msg.sender);
    	require(!channels[_channelId].finished);

    	address opponent = channels[_channelId].p1 == msg.sender ? channels[_channelId].p2 : channels[_channelId].p1;
    	bytes32 hash = keccak256(abi.encodePacked(_channelId, _pos, _seq, _type, _nonce, _path));
    	require(_recoverSig(hash, _sig) == signAddresses[opponent]);

    	bytes32 opponentRoot = channels[_channelId].p1 == msg.sender ? channels[_channelId].p2root : channels[_channelId].p1root;
    	if (keccak256(abi.encodePacked(_pos, _type, _nonce)) != _path[0] || _getRoot(_path) != opponentRoot) {
    		// only player that didn't cheat get plus one on finished gamess
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