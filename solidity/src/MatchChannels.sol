pragma solidity ^0.4.18;

contract MatchChannels {
    
    event Dispute(uint state);
    event ChannelOpened(address indexed sender, uint channelId, uint time);
    event ChannelStarted(address secondUser, uint channelId, uint time);
    event ChannelClosed();
    
    struct Channel {
      address firstUser;
      address secondUser;
      uint state;
      uint startTime;
      bool started;
      bool exists;
    }
    
    Channel[] public channels;

    uint MAX_OPEN_TIME = 60*60*3; // 3 hours
        
    function MatchChannels() public {
    }
    
    function createChannel() public payable {
        
        Channel memory newChannel = Channel({
           firstUser: msg.sender,
           secondUser: address(0),
           state: msg.value,
           startTime: now,
           started: false,
           exists: true
        });
        
        channels.push(newChannel);

        ChannelOpened(msg.sender, channels.length - 1, now);
    }
    
    function joinChannel(uint channelId) public payable {
        require(channels[channelId].exists == true);
        require(channels[channelId].started == false);
        
        channels[channelId].secondUser = msg.sender;
        channels[channelId].started = true;

        ChannelStarted(msg.sender, channelId, now);
    }
    
    function closeChannel(uint channelId) public {
        
    }
    
    function channelTimeout(uint channelId) public {
        Channel memory currChannel = channels[channelId];
        require(currChannel.exists == true);
        require(currChannel.started == true);
        require(currChannel.startTime + MAX_OPEN_TIME >= now);

        
    }
    
    //TODO: period for the other guy to add a new dispute
    function dispute(uint channelId, bytes32 h, uint8 v, bytes32 r, bytes32 s, uint state) public {
        Channel memory currChannel = channels[channelId];
        require(currChannel.exists == true);
        require(currChannel.started == true);
        
        address signer = ecrecover(h, v, r, s);
        
        // it must be signed by one of the players in the channel
        assert(signer == currChannel.firstUser || signer == currChannel.secondUser);
        
        bytes32 proof = keccak256(state);
        
        assert(proof == h);
        
        Dispute(state);
    }

    // Test methods will be removed!!!

    function testDispute(bytes32 h, uint8 v, bytes32 r, bytes32 s, uint state) public constant returns (bool) {

        address signer = ecrecover(h, v, r, s);

        if (signer != msg.sender) {
            return false;
        }

        bytes32 proof = keccak256(state);

        if (proof == h) {
            return true;
        } else {
            return false;
        }

    }
}

