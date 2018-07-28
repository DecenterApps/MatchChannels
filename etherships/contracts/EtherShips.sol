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

	uint HIT_SHIP = 1;

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
    function closeChannel(uint _channelId, bytes _sig, uint _numberOfGuesses, bytes32[35] _paths, uint[5] _pos, uint[5] _nonces) public {
		Channel storage c = channels[_channelId];

		require(c.p1 == msg.sender || c.p2 == msg.sender);
    	require(!c.finished);
    	require(msg.sender != c.halfFinisher);

		_didUserSetShips(_paths, _pos, _nonces, c.p1 == msg.sender ? c.p1root : c.p2root);
    	
    	address opponent = c.p1 == msg.sender ? c.p2 : c.p1;
    	bytes32 hash = keccak256(abi.encodePacked(_channelId, msg.sender, _numberOfGuesses));

       	require(_recoverSig(hash, _sig) == signAddresses[opponent]);

		uint wonAmount = c.stake * _numberOfGuesses / 5;

		// one player already submitted score
    	if (c.halfFinisher != address(0)) {
    		c.finished = true;

			_setScore(msg.sender, _numberOfGuesses, _channelId);

			_addBalanceToPlayer(msg.sender, wonAmount, _channelId);

			// sombody won the game
			if (c.p1Score == 5 || c.p2Score == 5) {
				players[c.p1].finishedGames += 1;
				players[c.p2].finishedGames += 1;

				// if game ended we send rest of stake to winner
				if (c.p1Score == 5) {
					_addBalanceToPlayer(c.p1, c.stake * (5 - c.p2Score) / 5, _channelId);
				} else {
					_addBalanceToPlayer(c.p2, c.stake * (5 - c.p1Score) / 5, _channelId);
				}
			}
			// nobody has won the game distribute the rest of the money accordingly
			else {
				_addBalanceToPlayer(c.p1, c.stake * (5 - c.p2Score) / 5, _channelId);
				_addBalanceToPlayer(c.p2, c.stake * (5 - c.p1Score) / 5, _channelId);
			}

    	} else { // the first time close is called on this channel
			c.halfFinisher = msg.sender;

			_setScore(msg.sender, _numberOfGuesses, _channelId);
			_addBalanceToPlayer(msg.sender, wonAmount, _channelId);
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
			_addBalanceToPlayer(c.p1, c.stake, _channelId);

			c.finished = true;
			emit CloseChannel(_channelId, msg.sender, c.finished);
		} 
		// If one of the players hasn't closed the game
		else if (c.halfFinisher != 0x0) {
			// the user gets all the left over money in the channel
			_addBalanceToPlayer(c.halfFinisher, c.balance, _channelId);

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
    	if (keccak256(abi.encodePacked(_pos, _type, _nonce)) != _path[0] || _getRoot(_path, (_pos + 1)) != opponentRoot) {
    		// only player that didn't cheat get plus one on finished games
    		players[msg.sender].finishedGames += 1;

			// gets all the leftover money from the channel
			_addBalanceToPlayer(msg.sender, c.balance, _channelId);
    		
    		c.p1Score = c.p1 == msg.sender ? 5 : 0;
    		c.p2Score = c.p2 == msg.sender ? 5 : 0;
    		c.finished = true;
			c.balance = 0;

    		emit CloseChannel(_channelId, msg.sender, true);
    	}
    }

	/** PRIVATE METHODS */

	/// @dev Checks if the user has set 5 ships in it's board
	/// @notice Used for unsorted merkle tree, the first element in _path is the leaf node
	/// @param _paths Merkle tree paths for the five nodes where ships are set
	/// @param _pos The position of those ships starting from 1-N
	/// @param _nonces The random nonce added to each node
	/// @param _root The root node of the tree we are checking
    function _didUserSetShips(bytes32[35] _paths, uint[5] _pos, uint[5] _nonces, bytes32 _root) private view {
        
        for(uint i = 0; i < 5; ++i) {
            bytes32 computedHash = keccak256(abi.encodePacked(_pos[i] - 1, HIT_SHIP, _nonces[i]));
            
            assert(computedHash == _paths[i*7]);

            uint posCopy = _pos[i];
            if (i>0) {
                assert(posCopy > _pos[i-1]);
            }

            for (uint j = 1; j < 7; j++) {
                bytes32 proofElement = _paths[(i * 7) + j];

                if (posCopy % 2 == 0) {
                    // Hash(current computed hash + current element of the proof)
                    computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
                    posCopy = posCopy / 2;
                } else {
                    // Hash(current element of the proof + current computed hash)
                    computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
                    posCopy = uint(posCopy)/2 + 1;
                }

            }
            
            assert(computedHash == _root);
        }
    }


	/// @dev Returns the address that signed
	/// @param _hash The hashed value thats signed
	/// @param _sig The signature we are checking
    function _recoverSig(bytes32 _hash, bytes _sig) private pure returns (address) {
		return prefixedRecover(_hash, _sig);
	}

	/// @dev Gets the root node from a merkle path
	/// @notice Used for unsorted merkle tree, the first element in _path is the leaf node
	/// @param _path The merkle tree path we are checking
	/// @param _pos Position of the starting node, goes 1-N
	function _getRoot(bytes32[7] _path, uint _pos) private pure returns(bytes32 _root) {
	    _root = _path[0];
	    
	    for (uint i = 1; i<7; i++) {
			if (_pos % 2 == 0) {
				_root = keccak256(abi.encodePacked(_path[i], _root));
			} else {
				_root = keccak256(abi.encodePacked(_root, _path[i]));
			}
	    }
    }

	/// @dev Helper method to add to user balance and check for overflow in channels balance
	/// @param _playerAddr The players address we are funding
	/// @param _amount Amount in wei we are adding
	/// @param _channelId The current channel the players in
	function _addBalanceToPlayer(address _playerAddr, uint _amount, uint _channelId) private {
		assert(_amount <= channels[_channelId].balance);
		players[_playerAddr].balance += _amount;
		channels[_channelId].balance -= _amount;
	}

	/// @dev Helper method to add to user score
	/// @param _sender The address of the user who we are updating the score for
	/// @param _numberOfGuesses Amount of guesses to set
	/// @param _channelId The current channel the players in
	function _setScore(address _sender, uint _numberOfGuesses, uint _channelId) private {
		if (_sender == channels[_channelId].p1) {
			channels[_channelId].p1Score = _numberOfGuesses;
		} else {
			channels[_channelId].p2Score = _numberOfGuesses;
		}
	}
}