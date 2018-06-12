pragma solidity ^0.4.24;

contract Players {

	struct Player {
		string username;
		uint balance;
		uint gamesPlayed;
		uint finishedGames;
		bool exists;
	}

	mapping(address => Player) public players;

	event NewPlayer(address indexed player, string username, uint balance);
	event AccountFunded(address indexed player, uint value);
	event Withdraw(address indexed player, uint amount);

	function createAccount(string _username) payable public {
		require(!players[msg.sender].exists);
		
		players[msg.sender] = Player({
				username: _username,
				balance: msg.value,
				gamesPlayed: 0,
				finishedGames: 0,
				exists: true
			});

		emit NewPlayer(msg.sender, _username, msg.value);
	}
	
	function fundAccount() payable public {
		require(players[msg.sender].exists);

		players[msg.sender].balance += msg.value;

		emit AccountFunded(msg.sender, msg.value);
	}

	function withdraw(uint _amount) public {
		require(players[msg.sender].exists);
		require(players[msg.sender].balance >= _amount);
		
		players[msg.sender].balance -= _amount;
		msg.sender.transfer(_amount);

		emit Withdraw(msg.sender, _amount);
	}
	
}