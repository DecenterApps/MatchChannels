pragma solidity ^0.4.18;

import "./Ownable.sol";
import "./ResolverInterface.sol";

contract StakeManager is Ownable {

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

	function addResolver(string _name, address _resolverAddress) public onlyOwner returns(uint _resolverId) {
		
		_resolverId = resolvers.length;
		resolvers.length++;

		ResolverStruct storage r = resolvers[_resolverId];
		r.name = _name;
		r.resolverAddress = _resolverAddress;
	}
	

	function openChannel(uint _resolverId) public payable returns(uint _channelId) {

        _channelId = channels.length;
        channels.length++;

        Channel storage c = channels[_channelId];
		c.p1 = _currUser();
		c.stake = msg.value;
		c.resolver = resolvers[_resolverId].resolverAddress;
	}

	function joinChannel(uint _channelId) public payable {
		require(_channelId < channels.length);
		require(!_isActive(_channelId));

		Channel storage c = channels[_channelId];
		
		require(c.stake <= msg.value);

		c.p2 = _currUser();
	}

	///@dev Maybe put contract address in state as well so cross contract reply attacks are prevented 
	// state should be first 8 places for number as channelId and after that one number where 0-draw,1-p1 wins,2-p2 wins
	// for example "000012340"-this is channelId == 1234 and its a draw
	function fastClose(uint _channelId, 
		bytes32 _h, 
		uint8 _v, 
		bytes32 _r, 
		bytes32 _s, 
		bytes _state) public {

		require(_isActive(_channelId));
		
		Channel storage c = channels[_channelId];

		address signer = _resolveRecover(_h, _v, _r, _s, _state);
		address opponent = _getOtherPlayer(_channelId, _currUser());

		assert(signer == opponent);

		uint channelId;
		uint winner;

		(channelId, winner) = _getState(_state);

		assert(_channelId == channelId);

		_closeChannel(_channelId, winner == 0 ? 0x0 : (winner == 1 ? c.p1 : c.p2));
	}

	function disputeMove(uint _channelId, 
		bytes32[2] _h, 
		uint8[2] _v, 
		bytes32[2] _r, 
		bytes32[2] _s,
		bytes _state1,
		bytes _state2
		) public {
		
		require(_isActive(_channelId));

		Channel storage c = channels[_channelId];

		address signer = _resolveRecover(_h[0], _v[0], _r[0], _s[0], _state1);
		address signer2 = _resolveRecover(_h[1], _v[1], _r[1], _s[1], _state2);

        // both moves must be signed by other player
        assert(signer == signer2);
        assert(signer == _getOtherPlayer(_channelId, _currUser()));

        if (ResolverInterface(c.resolver).resolve(_state1, _state2)) {
        	_closeChannel(_channelId, _getOtherPlayer(_channelId, _currUser()));
        } else {
        	_closeChannel(_channelId, _currUser());
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

		if (c.winner == 0x0) {
			owner.transfer(c.stake * 2);
		} else {
			c.winner.transfer(c.stake * 2);
		}
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

	function _getState(bytes _state) private pure returns(uint _channelId, uint _winner) {

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

	function _resolveRecover(bytes32 _h, uint8 _v, bytes32 _r, bytes32 _s, bytes _currState) private pure returns(address _signer) {
		bytes32 proof = keccak256(_currState);
		assert(proof == _h);

		_signer = ecrecover(_h, _v, _r, _s);
	}
	
	function nChannel() public view returns(uint _n) {
	    _n = channels.length;
	}
	
	function _isActive(uint _channelId) private view returns(bool _active) {
	
		_active = (channels[_channelId].p1 != 0x0) && (channels[_channelId].p2 != 0x0) && !channels[_channelId].finished;
	}

	function _getOtherPlayer(uint _channelId, address _player) private view returns(address _otherPlayer) {
		_otherPlayer = (channels[_channelId].p1 == _player) ? channels[_channelId].p2 : channels[_channelId].p1;  
	}

	function _currUser() private view returns(address currUser) {
		currUser = msg.sender;
	}

	function _currBlock() private view returns(uint currBlock) {
		currBlock = block.number;
	}
}