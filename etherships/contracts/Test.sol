pragma solidity ^0.4.22;

contract Test {
    
    event OpenChannel(bytes32 _root, string _webrtcId);
    event JoinChannel(uint _channelId, bytes32 _root, string _webrtcId);
    
    function openChannel(bytes32 _root, string _webrtcId) public {
        emit OpenChannel(_root, _webrtcId);
    }
    
    function joinChannel(uint _channelId, bytes32 _root, string _webrtcId) public {
        emit JoinChannel(_channelId, _root, _webrtcId);
    }
    
}