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
		bool halfFinished;
		bool finished;
	}

	event OpenChannel(uint channelId, bytes32 root, string webrtcId, uint amount, string username);
	event JoinChannel(uint channelId, bytes32 root, string webrtcId, uint amount);
	event CloseChannel(uint channelId, address player, bool finished);

	Channel[] public channels;
	mapping(address => address) signAddresses;

	function openChannel(bytes32 _merkleRoot, string _webrtcId, uint _amount, address _signAddress) payable public {
		require(players[msg.sender].exists);
		require(_amount < players[msg.sender].balance + msg.value);

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

        emit OpenChannel(_channelId, _merkleRoot, _webrtcId, _amount, players[msg.sender].username);
    }
    
    function joinChannel(uint _channelId, bytes32 _merkleRoot, string _webrtcId, uint _amount, address _signAddress) payable public {
    	require(_channelId < channels.length);
		require((channels[_channelId].p1 != 0x0) && (channels[_channelId].p2 == 0x0));
		require(players[msg.sender].exists);
		require(_amount < players[msg.sender].balance + msg.value);

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
    	
    	address opponent = channels[_channelId].p1 == msg.sender ? channels[_channelId].p2 : channels[_channelId].p1;
    	bytes32 hash = keccak256(abi.encodePacked(_channelId, msg.sender, _numberOfGuesses));

    	require(_recoverSig(hash, _sig) == signAddresses[opponent]);

    	players[msg.sender].balance += channels[_channelId].stake * _numberOfGuesses / 5;
    	players[opponent].balance += channels[_channelId].stake * (5-_numberOfGuesses) / 5;

    	if (channels[_channelId].halfFinished) {
    		// one player already submitted score
    		channels[_channelId].finished = true;
    		if (msg.sender == channels[_channelId].p1) {
				channels[_channelId].p1Score = _numberOfGuesses;
			} else {
				channels[_channelId].p2Score = _numberOfGuesses;
			}

			if (channels[_channelId].p1Score == 5 || channels[_channelId].p2Score == 5) {
				players[channels[_channelId].p1].finishedGames += 1;
				players[channels[_channelId].p2].finishedGames += 1;
			}
    	} else {
    		// other player still didn't answer
			channels[_channelId].halfFinished = true;
			if (msg.sender == channels[_channelId].p1) {
				channels[_channelId].p1Score = _numberOfGuesses;
			} else {
				channels[_channelId].p2Score = _numberOfGuesses;
			}
    	}

    	emit CloseChannel(_channelId, msg.sender, channels[_channelId].finished);
    }

    function _recoverSig(bytes32 _hash, bytes _sig) private pure returns (address) {

		return prefixedRecover(_hash, _sig);
	}
    
}