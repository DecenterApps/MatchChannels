pragma solidity ^0.4.24;

import "./ECTools.sol";

// board is 8x8
contract EtherShips is ECTools {

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

	event Test(address first, address second, bytes32 _hash);

	Channel[] public channels;
	mapping(address => address) signAddresses;

	uint public constant MAX_OPEN_TIME = 500;

	event MatchWinner(uint channelId, address winner);
	event TimeoutDisputeStarted(uint channelId, address disputer, uint lastSequence);
	event TimeoutDisputeContinued(uint channelId, uint lastSequence);

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

	// user sends here something wrong signed by opponent
	// wrong hash sent
	// score doesn't go up based on type
	// is there a way to check score without taking look at previous state? 
	function disputeMove(uint _channelId, bytes _sig, uint _pos, uint _seq, uint _type, uint _nonce, uint _hp, uint _ap, bytes32[7] _path) public {
		
	}

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