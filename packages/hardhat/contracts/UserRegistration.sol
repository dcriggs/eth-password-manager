// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserRegistration {
	string public greeting = "Testing User Registration!";
	address public owner;

	mapping(address => bytes32) private userToHashedPassword;
	mapping(address => bool) private isRegistered;

	event UserRegistered(address indexed user);
	event PasswordUpdated(address indexed user);

	constructor(address _owner) {
		owner = _owner == address(0) ? msg.sender : _owner; // Default to deployer if _owner is address(0)
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "Not the contract owner");
		_;
	}

	modifier onlyRegistered() {
		require(isRegistered[msg.sender], "User is not registered.");
		_;
	}

	function registerUser(bytes32 hashedPassword) external {
		require(!isRegistered[msg.sender], "User already registered.");
		require(hashedPassword != bytes32(0), "Invalid password.");

		userToHashedPassword[msg.sender] = hashedPassword;
		isRegistered[msg.sender] = true;

		emit UserRegistered(msg.sender);
	}

	function authenticateUser(
		address user,
		bytes32 hashedPassword
	) external view returns (bool) {
		require(isRegistered[user], "User is not registered.");
		// Additional authentication logic
		return userToHashedPassword[user] == hashedPassword;
	}

	function updatePassword(bytes32 newHashedPassword) external onlyRegistered {
		require(newHashedPassword != bytes32(0), "Invalid new password.");

		userToHashedPassword[msg.sender] = newHashedPassword;

		emit PasswordUpdated(msg.sender);
	}
}
