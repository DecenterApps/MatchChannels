pragma solidity 0.4.21;

/// @title Counter factual registry for deploying and fetching contracts
contract CfResolverRegistry {
    
    mapping(bytes32 => address) public registry;
    
    // potentialy store the contract bytecode (of our resolvers)
    // so the user who deploys them has a reduced gas cost

    
    /// @notice Deploys the resolver with the bytecode both the users agreed on
    /// @param _contractCode Bytecode of the contract to be deployed
    /// @param _players Adresses of the players which signed the contract code
    function deployContract(bytes _contractCode, address[2] _players,  uint8[2] _v, bytes32[2] _r, bytes32[2] _s) public {
        
        bytes32 cfAddress = keccak256(_contractCode);
        
        bool player1Signed = _checkSignature(_players[0], cfAddress, _v[0], _r[0], _s[0]);
        bool player2Signed = _checkSignature(_players[1], cfAddress, _v[1], _r[1], _s[1]);
        
        assert(player1Signed && player2Signed);
        
        address contractAddr;
        
        assembly {
            contractAddr := create(0, add(_contractCode, 0x20), mload(_contractCode))
        }
        
        registry[cfAddress] = contractAddr;
    }
    
    /// @notice Checks if the user has signed the cfAddress thats about to be deployed
    function _checkSignature(address _playerAddr, bytes32 _cfAddr, uint8 _v, bytes32 _r, bytes32 _s) private pure returns(bool) {
		address signedAddr = ecrecover(_cfAddr, _v, _r, _s);
		
		return signedAddr == _playerAddr;
    }
    
    function getContract(bytes32 _cfAddress) public view returns(address) {
        return registry[_cfAddress];
    }
    
    
}