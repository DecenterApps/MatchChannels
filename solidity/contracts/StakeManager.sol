pragma solidity ^0.4.23;

import "./Ownable.sol";
import "./ResolverInterface.sol";
import "./ECTools.sol";

contract StakeManager is Ownable, ECTools {

	// _type - 0 is for fastClose and 1 is for a dispute
	event MatchOutcome(uint _channelId, address _winner, uint _stake, uint _type);

	event Test(address signer, address opponent);

	struct Channel {
		address p1;
		address p2;
		uint stake;
		address resolver;
		address winner;
		bool finished;
		uint resolveStart;
	}

	struct ResolverStruct {
		address resolverAddress;
		string name;
	}
	
	uint constant MAX_OPEN_TIME = 500; // 500 blocks
	
	Channel[] public channels;
	ResolverStruct[] public resolvers;
	mapping(address => address) signAddresses;
	

	function addResolver(string _name, address _resolverAddress) public onlyOwner returns(uint _resolverId) {
		
		_resolverId = resolvers.length;
		resolvers.length++;

		ResolverStruct storage r = resolvers[_resolverId];
		r.name = _name;
		r.resolverAddress = _resolverAddress;
	}
	

	function openChannel(uint _resolverId, address _signAddress) public payable returns(uint _channelId) {

        _channelId = channels.length;
        channels.length++;

        signAddresses[msg.sender] = _signAddress;

        Channel storage c = channels[_channelId];
		c.p1 = msg.sender;
		c.stake = msg.value;
		c.resolver = resolvers[_resolverId].resolverAddress;
	}

	function joinChannel(uint _channelId, address _signAddress) public payable {
		require(_channelId < channels.length);
		require(!_isActive(_channelId));

		signAddresses[msg.sender] = _signAddress;

		Channel storage c = channels[_channelId];
		
		require(c.stake <= msg.value);

		c.p2 = msg.sender;
	}

	///@dev Maybe put contract address in state as well so cross contract reply attacks are prevented 
	// state should be first 8 places for number as channelId and after that one number where 0-draw,1-p1 wins,2-p2 wins
	// for example "000012340"-this is channelId == 1234 and its a draw
	function fastClose(uint _channelId, bytes32 _h, bytes sig, bytes _state) public {
		// channel must be active
		require(_isActive(_channelId));
		// only player from this channel can close channel
		require(msg.sender == channels[_channelId].p1 || msg.sender == channels[_channelId].p2);
		
		Channel memory c = channels[_channelId];

		address signer = recoverSig(_h, sig, _state);
		// to close channel you need to have signature of other player
		require(_signingAddress(_getOpponent(_channelId, msg.sender)) == signer);

		uint channelId;
		uint winner;

		(channelId, winner) = _readWinner(_state);

		assert(_channelId == channelId);

		address winnerAddr = winner == 0 ? 0x0 : (winner == 1 ? c.p1 : c.p2);

		_closeChannel(_channelId, winnerAddr);

		emit MatchOutcome(_channelId, winnerAddr, c.stake, 1);
	}

	function disputeMove(uint _channelId, 
		bytes32[2] _h, 
		bytes _sig1,
		bytes _sig2,
		bytes _state1,
		bytes _state2
		) public {
		
		require(_isActive(_channelId));

		Channel memory c = channels[_channelId];

		address signer = recoverSig(_h[0], _sig1, _state1);
		address signer2 = recoverSig(_h[1], _sig2, _state2);

		address opponent = _getOpponent(_channelId, msg.sender);

		emit Test(signer, signer2);

        // both moves must be signed by other player
        // assert(signer2 == _signingAddress(opponent));
        // assert(signer == _signingAddress(opponent));

        // if (ResolverInterface(c.resolver).resolve(_state1, _state2)) {
        // 	_closeChannel(_channelId, opponent);
		// 	emit MatchOutcome(_channelId, opponent, c.stake, 1);
        // } else {
        // 	_closeChannel(_channelId, msg.sender);
        // }
	}

	function challengeTimeout(uint _channelId, 
		bytes32[2] _h, 
		bytes _sig1,
		bytes _sig2,
		bytes _state1,
		bytes _state2
		) public {

		require(_isActive(_channelId));

		Channel storage c = channels[_channelId];

		address signer = recoverSig(_h[0], _sig1, _state1);
		address signer2 = recoverSig(_h[1], _sig2, _state2);

		require(signer == _signingAddress(_getOpponent(_channelId, msg.sender)));
		require(signer2 == _signingAddress(msg.sender));
		
		if (ResolverInterface(c.resolver).resolve(_state1, _state2)) {

		} 
	}

	function _getWinner(uint _channelId, bytes _state) private view returns(address _winner) {
		Channel memory c = channels[_channelId];

		bool p1winner = ResolverInterface(c.resolver).isWinner(_state, _getSign(_channelId, c.p1));
		bool p2winner = ResolverInterface(c.resolver).isWinner(_state, _getSign(_channelId, c.p2));

		// its not possible that both players win
		assert(!(p1winner == p2winner && p1winner));

		//if its both false then _winner is 0x0 else if p1winner then p1 else p2
		_winner = (p1winner == p2winner) ? 0x0 : (p1winner ? c.p1 : c.p2);
	}

	function closeTimeoutedChannel(uint _channelId) public {
		Channel memory c = channels[_channelId];

		require(_isActive(_channelId));
		require(!c.finished);
		require(c.resolveStart + MAX_OPEN_TIME < _currBlock());
	}

	function _closeChannel(uint _channelId, address _winner) private {
		require (_isActive(_channelId));

		Channel storage c = channels[_channelId];

		if (_winner == 0x0) {
			c.p1.transfer(c.stake);
			c.p2.transfer(c.stake);
		} else {
			_winner.transfer(c.stake * 2);
		}

		c.finished = true;
		c.winner = _winner;
	}
	

	function _getSign(uint _channelId, address _player) private view returns(uint _sign) {
		
		if (channels[_channelId].p1 == _player) {
			_sign = 1;
		} else {
			_sign = 2;
		}
	}

	function _readWinner(bytes _state) private pure returns(uint _channelId, uint _winner) {

        for (uint i=8; i>0; i--){
            byte t;
            assembly {
                t := mload(add(_state, add(32, sub(8, i))))
            }
            uint8 num = uint8(t) - 48;
            _channelId = _channelId*10+num;
        }
        
        byte winner;
        assembly {
            winner := mload(add(_state, 40))
        }

        _winner = uint8(winner) - 48;
        
        assert(_winner < 3);
	}

	function recoverSig(bytes32 _hash, bytes _sig, bytes _state) public view returns (address) {
		assert(keccak256(_state) == _hash);

		return prefixedRecover(_hash, _sig);
	}
	
	function nChannel() public view returns(uint _n) {
	    _n = channels.length;
	}
	
	function _isActive(uint _channelId) private view returns(bool _active) {
	
		_active = (channels[_channelId].p1 != 0x0) && (channels[_channelId].p2 != 0x0) && !channels[_channelId].finished;
	}

	function _getOpponent(uint _channelId, address _player) private view returns(address _opponent) {
		_opponent = (channels[_channelId].p1 == _player) ? channels[_channelId].p2 : channels[_channelId].p1;  
	}

	function _signingAddress(address _address) private view returns(address signingAddress) {
		signingAddress = signAddresses[_address];
	}

	function _currBlock() private view returns(uint currBlock) {
		currBlock = block.number;
	}
}