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
	}

	event Test(address first, address second, bytes32 _hash);

	Channel[] public channels;
	mapping(address => address) signAddresses;

	event MatchWinner(uint channelId, address winner);
	
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