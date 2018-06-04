pragma solidity ^0.4.24;

import "./ECTools.sol";

// board is 8x8
contract EtherShipsV2 is ECTools {

	struct Channel {
		address p1;
		address p2;
		uint stake;
		bytes32 p1root;
		bytes32 p2root;
		bool finished;
		uint timeoutStart;
		uint timeoutSequence;
		address timeoutDisputer;
	}

	event Test(address first, address second);

	Channel[] public channels;
	mapping(address => address) signAddresses;

	uint public constant MAX_OPEN_TIME = 500;

	event MatchWinner(uint channelId, address winner);
	event TimeoutDisputeStarted(uint channelId, address disputer, uint lastSequence);
	event TimeoutDisputeContinued(uint channelId, uint lastSequence);
	event ChannelOpened(uint channelId, address player);
	event ChannelJoined(uint channelId, address player);

	function openChannel(address _signAddress, bytes32 _merkleRoot) public payable returns(uint _channelId) {

        _channelId = channels.length;
        channels.length++;

        signAddresses[msg.sender] = _signAddress;

        Channel storage c = channels[_channelId];
		c.p1 = msg.sender;
		c.stake = msg.value;
		c.p1root = _merkleRoot;
	}

	function joinChannel(uint _channelId, address _signAddress, bytes32 _merkleRoot) public payable {
		require(_channelId < channels.length);
		require((channels[_channelId].p1 != 0x0) && (channels[_channelId].p2 == 0x0));

		signAddresses[msg.sender] = _signAddress;

		Channel storage c = channels[_channelId];
		
		require(c.stake <= msg.value);

		c.p2 = msg.sender;
		c.p2root = _merkleRoot;
	}
    
    // if you have signed message from other player where someone of you has score 5, we count that as a winner
    function closeChannel(uint _channelId, bytes _sig, uint _pos, uint _seq, uint _type, uint _nonce, uint _hp, uint _ap, bytes32[7] _path) public {
    	require(keccak256(abi.encodePacked(_pos, _type, _nonce)) == _path[0]);

    	require(channels[_channelId].p1 == msg.sender || channels[_channelId].p2 == msg.sender);
    	require(!channels[_channelId].finished);
    	require(_getRoot(_path) == channels[_channelId].p1root || _getRoot(_path) == channels[_channelId].p2root); 
    	
    	address opponent = channels[_channelId].p1 == msg.sender ? signAddresses[channels[_channelId].p2] : signAddresses[channels[_channelId].p1];

    	bytes32 hash = keccak256(abi.encodePacked(_pos, _seq, _type, _nonce, _hp, _ap, _path));

    	require(_recoverSig(hash, _sig) == opponent);
    	require(_hp == 5 || _ap == 5);

    	channels[_channelId].finished = true;	
    	address winner = _hp == 5 ? channels[_channelId].p1 : channels[_channelId].p2;

    	emit MatchWinner(_channelId, winner);
	}

	/// @param _channelId id of channel
    /// @param _mType message types 0 or 1
    /// @param _sig1 signature for first message
    /// @param _sig2 signature for second message
    /// @param _pos positions 
    /// @param _seq sequence of each message
    /// @param _type type of that position (0 if no ether, or 1 if there is)
    /// @param _nonce nonce for that specific field
    /// @param _hp current state of home points
    /// @param _ap current state of away points
    /// @param _path paths of merkle tree 
	function wrongScore(uint _channelId, 
						uint[2] _mType, 
						bytes _sig1,
						bytes _sig2, 
						uint[2] _pos, 
						uint[2] _seq, 
						uint[2] _type, 
						uint[2] _nonce, 
						uint[2] _hp, 
						uint[2] _ap, 
						bytes32[7][2] _path) public {

		require(channels[_channelId].p1 == msg.sender || channels[_channelId].p2 == msg.sender);
    	require(!channels[_channelId].finished);
    	require(_mType[0] != _mType[1]);
    	require(_type[0] < 2 && _type[1] < 2);
    	
    	

		address opponent = channels[_channelId].p1 == msg.sender ? signAddresses[channels[_channelId].p2] : signAddresses[channels[_channelId].p1];

		for (uint i=0; i<2; i++) {
			if (_mType[i] == 0) {
				/// its message type 0
		    	require(_recoverSig(keccak256(abi.encodePacked(_pos[i], _seq[i], _hp[i], _ap[i])), (i == 0) ? _sig1 : _sig2) == opponent);
				
			} else if (_mType[i] == 1) {
				/// its message type 1
				require(_recoverSig(keccak256(abi.encodePacked(_pos[i], _seq[i], _type[i], _nonce[i], _hp[i], _ap[i], _path[i])), (i == 0) ? _sig1 : _sig2) == opponent);
				require(_getRoot(_path[i]) == channels[_channelId].p1root || _getRoot(_path[i]) == channels[_channelId].p2root); 
				require(keccak256(abi.encodePacked(_pos[i], _type[i], _nonce[i])) == _path[i][0]);

			} else { 
				
				return;
			}
		}

		if (_mType[0] == 0) {
			require(_seq[0] == _seq[1] && _mType[1] == 1);

			if (_type[1] == 1) {
				// if player guessed then it should change score
				if (msg.sender == channels[_channelId].p1) {
					require(_hp[1] == _hp[0] + 1);
					require(_ap[1] == _ap[0]);
				} else {
					require(_ap[1] == _ap[0] + 1);
					require(_hp[1] == _hp[0]);
				}
			} else {
				//if its not guessed than scores should stay same
				require(_ap[1] == _ap[0]);
				require(_hp[1] == _hp[0]);
			}
		}else {
			require(_seq[0]+1 == _seq[1] && _mType[1] == 0);
			// score should be same
			require(_ap[1] == _ap[0]);
			require(_hp[1] == _hp[0]);	
		}

	}

	// user sends here something wrong signed by opponent
	// wrong hash sent
	// score doesn't go up based on type
	// is there a way to check score without taking look at previous state? 
	// function disputeMove(uint _channelId, bytes _sig, uint _pos, uint _seq, uint _type, uint _nonce, uint _hp, uint _ap, bytes32[7] _path) public {
		
	// }

	// when user doesn't answer to your message 
	// also can be used if he tries to cheat you by sending something he already sent 
	// or something that you can't send to disputeMove for some reason
	function disputeTimeout(uint _channelId, bytes _sig, uint _pos, uint _seq, uint _type, uint _nonce, uint _hp, uint _ap, bytes32[7] _path) public {
		require(keccak256(abi.encodePacked(_pos, _type, _nonce)) == _path[0]);

		require(channels[_channelId].p1 == msg.sender || channels[_channelId].p2 == msg.sender);
		require(!channels[_channelId].finished);
		require(_getRoot(_path) == channels[_channelId].p1root || _getRoot(_path) == channels[_channelId].p2root); 

		bytes32 hash = keccak256(abi.encodePacked(_pos, _seq, _type, _nonce, _hp, _ap, _path));

    	require(_recoverSig(hash, _sig) == msg.sender);

    	channels[_channelId].timeoutStart = block.number;
    	channels[_channelId].timeoutSequence = _seq;
    	channels[_channelId].timeoutDisputer = msg.sender;

    	emit TimeoutDisputeStarted(_channelId, msg.sender, _seq);
	}

	function continueChannel(uint _channelId, bytes _sig, uint _pos, uint _seq, uint _type, uint _nonce, uint _hp, uint _ap, bytes32[7] _path) public {
		require(keccak256(abi.encodePacked(_pos, _type, _nonce)) == _path[0]);

		require(channels[_channelId].p1 == msg.sender || channels[_channelId].p2 == msg.sender);
		require(!channels[_channelId].finished);
		require(_getRoot(_path) == channels[_channelId].p1root || _getRoot(_path) == channels[_channelId].p2root); 

		address opponent = channels[_channelId].p1 == msg.sender ? signAddresses[channels[_channelId].p2] : signAddresses[channels[_channelId].p1];
		require(channels[_channelId].timeoutDisputer == opponent);
		
		bytes32 hash = keccak256(abi.encodePacked(_pos, _seq, _type, _nonce, _hp, _ap, _path));
		require(_recoverSig(hash, _sig) == msg.sender);
		require(channels[_channelId].timeoutSequence == _seq-1);

		channels[_channelId].timeoutStart = 0;
    	channels[_channelId].timeoutSequence = 0;
    	channels[_channelId].timeoutDisputer = address(0);

    	emit TimeoutDisputeContinued(_channelId, _seq);
	}	

	function closeAfterTimeout(uint _channelId) public {
		// if they continued playing and game is closed already, it is not possible to close on "timeout" disputed before
		require(!channels[_channelId].finished);
		require(channels[_channelId].timeoutStart != 0 && channels[_channelId].timeoutStart < block.number - MAX_OPEN_TIME);

		channels[_channelId].finished = true;

		emit MatchWinner(_channelId, channels[_channelId].timeoutDisputer);
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