pragma solidity ^0.4.24;

import "./ECTools.sol";
import "./Players.sol";

/// @title State channel implementation for the clasic Battleship game
contract EtherShips is Players, ECTools {

	struct Channel {
		address p1;
		address p2;
		uint stake;
		bytes32 p1root;
		bytes32 p2root;
		address halfFinisher;
		uint blockStarted;
		uint balance;
		uint p1Score;  //------|
		uint p2Score;  //      | TODO: squeeze this into one memory slot
		bool finished; //------|
	}

	event OpenChannel(uint channelId, bytes32 root, string webrtcId, uint amount, string username, address indexed addr);
	event JoinChannel(uint channelId, bytes32 root, string webrtcId, uint amount, address indexed addr);
	event CloseChannel(uint channelId, address indexed player, bool finished);

	Channel[] public channels;
	mapping(address => address) public signAddresses;

	uint TIMEOUT_NUM_BLOCKS = 50; // TODO: this number is used for testing

	/// @dev User opens a channel and waits for the opponent to join
	/// @param _merkleRoot The root node of your boards state
	/// @param _webrtcId Connection id used for p2p webrtc connection
	/// @param _amount Amount in wei for the channel, joining user must match the amount
	/// @param _signAddress Opens channel with one MetaMask address, sign state with anoother
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
		c.blockStarted = block.number;
		c.balance += _amount;

        emit OpenChannel(_channelId, _merkleRoot, _webrtcId, _amount, players[msg.sender].username, msg.sender);
    }
    
	/// @dev User joins an already opened channe;
	/// @param _channelId The id of the channel you want to join
	/// @param _merkleRoot The root node of your boards state
	/// @param _webrtcId Connection id used for p2p webrtc connection
	/// @param _amount Amount in wei for you yo join the channel
	/// @param _signAddress Opens channel with one MetaMask address, sign state with anoother
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
		c.blockStarted = block.number;
		c.balance += _amount;

		// update player stats
		players[msg.sender].balance -= _amount;
		players[c.p1].gamesPlayed += 1;
		players[c.p2].gamesPlayed += 1;

        emit JoinChannel(_channelId, _merkleRoot, _webrtcId, _amount, msg.sender);
    }

	/// @dev Closes the channel, both users must call this for it to be succesfully closed
	/// @param _channelId The id of the channel you want to close
	/// @param _sig The signature of the other user confirming how many ships you hit
	/// @param _numberOfGuesses Number of ships you hit
    function closeChannel(uint _channelId, bytes _sig, uint _numberOfGuesses) public {
		Channel storage c = channels[_channelId];

		require(c.p1 == msg.sender || c.p2 == msg.sender);
    	require(!c.finished);
    	require(msg.sender != c.halfFinisher);
    	
    	address opponent = c.p1 == msg.sender ? c.p2 : c.p1;
    	bytes32 hash = keccak256(abi.encodePacked(_channelId, msg.sender, _numberOfGuesses));

       	require(_recoverSig(hash, _sig) == signAddresses[opponent]);

		uint wonAmount = c.stake * _numberOfGuesses / 5;

		// one player already submitted score
    	if (c.halfFinisher != address(0)) {
    		c.finished = true;

			addScore(msg.sender, _numberOfGuesses, _channelId);

			addBalanceToPlayer(msg.sender, wonAmount, _channelId);

			// sombody won the game
			if (c.p1Score == 5 || c.p2Score == 5) {
				players[c.p1].finishedGames += 1;
				players[c.p2].finishedGames += 1;

				// if game ended we send rest of stake to winner
				if (c.p1Score == 5) {
					addBalanceToPlayer(c.p1, c.stake * (5 - c.p2Score) / 5, _channelId);
				} else {
					addBalanceToPlayer(c.p2, c.stake * (5 - c.p1Score) / 5, _channelId);
				}
			}
			// nobody has won the game distribute the rest of the money accordingly
			else {
				addBalanceToPlayer(c.p1, c.stake * (5 - c.p2Score) / 5, _channelId);
				addBalanceToPlayer(c.p2, c.stake * (5 - c.p1Score) / 5, _channelId);
			}

    	} else { // the first time close is called on this channel
			c.halfFinisher = msg.sender;

			addScore(msg.sender, _numberOfGuesses, _channelId);
			addBalanceToPlayer(msg.sender, wonAmount, _channelId);
    	}

    	emit CloseChannel(_channelId, msg.sender, c.finished);
    }

	/// @dev After N blocks if the channel isn't closed/joined the user can timeout close it
	/// @param _channelId Id of the channel
	function timeout(uint _channelId) public {
		Channel storage c = channels[_channelId];

		require(c.p1 == msg.sender || c.p2 == msg.sender);
		require(block.number > (c.blockStarted + TIMEOUT_NUM_BLOCKS));
		require(!c.finished);

		// If nobody joined the channel let the user retreive the money
		if (c.p2 == 0x0) {
			addBalanceToPlayer(c.p1, c.stake, _channelId);

			c.finished = true;
			emit CloseChannel(_channelId, msg.sender, c.finished);
		} 
		// If one of the players hasn't closed the game
		else if (c.halfFinisher != 0x0) {
			// the user gets all the left over money in the channel
			addBalanceToPlayer(c.halfFinisher, c.balance, _channelId);

			c.finished = true;
			c.balance = 0;
			c.p1Score = c.p1 == msg.sender ? 5 : 0;
    		c.p2Score = c.p2 == msg.sender ? 5 : 0;
			
			players[msg.sender].finishedGames += 1;

			emit CloseChannel(_channelId, msg.sender, c.finished);
		}
	}

	/// @dev If the other player lies that you didn't hit his ships merkle proof resolve that he's cheating
	/// @param _channelId Id of the channel
	/// @param _sig Signature of the move that you're disputing
	/// @param _pos Position on the grid
	/// @param _seq Sequence number of the move
	/// @param _type Type 1 means is hit, 0 is missed
	/// @param _nonce The nonce the user hashed the field
	/// @param _path Merkle path that is disputed
    function disputeAnswer(uint _channelId, bytes _sig, uint _pos, uint _seq, uint _type, uint _nonce, bytes32[7] _path) public {
		Channel storage c = channels[_channelId];
		
    	require(c.p1 == msg.sender || c.p2 == msg.sender);
    	require(!c.finished);

    	address opponent = c.p1 == msg.sender ? c.p2 : c.p1;
		
    	bytes32 hash = keccak256(abi.encodePacked(_channelId, _pos, _seq, _type, _nonce, _path));
    	require(_recoverSig(hash, _sig) == signAddresses[opponent]);

    	bytes32 opponentRoot = c.p1 == msg.sender ? c.p2root : c.p1root;
    	if (keccak256(abi.encodePacked(_pos, _type, _nonce)) != _path[0] || _getRoot(_path) != opponentRoot) {
    		// only player that didn't cheat get plus one on finished games
    		players[msg.sender].finishedGames += 1;

			// gets all the leftover money from the channel
			addBalanceToPlayer(msg.sender, c.balance, _channelId);
    		
    		c.p1Score = c.p1 == msg.sender ? 5 : 0;
    		c.p2Score = c.p2 == msg.sender ? 5 : 0;
    		c.finished = true;
			c.balance = 0;

    		emit CloseChannel(_channelId, msg.sender, true);
    	}
    }

	/** PRIVATE METHODS */

	function addBalanceToPlayer(address _p, uint _amount, uint _channelId) private {
		assert(_amount <= channels[_channelId].balance);
		players[_p].balance += _amount;
		channels[_channelId].balance -= _amount;
	}

	function addScore(address _sender, uint _numberOfGuesses, uint _channelId) private {
		if (_sender == channels[_channelId].p1) {
			channels[_channelId].p1Score = _numberOfGuesses;
		} else {
			channels[_channelId].p2Score = _numberOfGuesses;
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