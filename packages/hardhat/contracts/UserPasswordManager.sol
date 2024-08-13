// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserPasswordManager {
	string public greeting =
		"Testing User Registration and Password Management!";
	address public owner;

	struct PasswordData {
		string website;
		string userName;
		bytes32 hashedPassword;
	}

	mapping(address => bytes32) private userToHashedPassword;
	mapping(address => bool) private isRegistered;
	mapping(address => PasswordData[]) private userPasswords;

	event UserRegistered(address indexed user);
	event RegistrationUpdated(address indexed user);
	event PasswordStored(address indexed user, string website);
	event PasswordDetailsUpdated(address indexed user, string website);
	event PasswordDeleted(address indexed user, string website);

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

	modifier onlyAuthenticated(bytes32 hashedPassword) {
		require(
			userToHashedPassword[msg.sender] == hashedPassword,
			"Authentication failed."
		);
		_;
	}

	function isUserRegistered(address user) public view returns (bool) {
		return isRegistered[user];
	}

	function registerUser(bytes32 hashedPassword) external {
		require(!isRegistered[msg.sender], "User already registered.");
		require(hashedPassword != bytes32(0), "Invalid password.");

		userToHashedPassword[msg.sender] = hashedPassword;
		isRegistered[msg.sender] = true;

		emit UserRegistered(msg.sender);
	}

	function authenticateUser(
		bytes32 authenticationHash
	)
		external
		view
		onlyRegistered
		onlyAuthenticated(authenticationHash)
		returns (bool)
	{
		return true;
	}

	function updateRegistrationPassword(
		bytes32 authenticationHash,
		bytes32 newHashedPassword
	) external onlyRegistered onlyAuthenticated(authenticationHash) {
		require(newHashedPassword != bytes32(0), "Invalid new password.");

		userToHashedPassword[msg.sender] = newHashedPassword;

		emit RegistrationUpdated(msg.sender);
	}

	function storePassword(
		string memory website,
		string memory userName,
		bytes32 hashedPassword,
		bytes32 authenticationHash
	) external onlyRegistered onlyAuthenticated(authenticationHash) {
		PasswordData memory newPasswordData = PasswordData({
			website: website,
			userName: userName,
			hashedPassword: hashedPassword
		});

		userPasswords[msg.sender].push(newPasswordData);

		emit PasswordStored(msg.sender, website);
	}

	function updatePasswordDetails(
		uint index,
		string memory website,
		string memory userName,
		bytes32 newHashedPassword,
		bytes32 authenticationHash
	) external onlyRegistered onlyAuthenticated(authenticationHash) {
		require(index < userPasswords[msg.sender].length, "Invalid index.");

		PasswordData storage passwordData = userPasswords[msg.sender][index];
		passwordData.website = website;
		passwordData.userName = userName;
		passwordData.hashedPassword = newHashedPassword;

		emit PasswordDetailsUpdated(msg.sender, website);
	}

	function deletePassword(
		uint index,
		bytes32 authenticationHash
	) external onlyRegistered onlyAuthenticated(authenticationHash) {
		require(index < userPasswords[msg.sender].length, "Invalid index.");

		PasswordData memory passwordData = userPasswords[msg.sender][index];

		// Move the last element into the place to delete
		userPasswords[msg.sender][index] = userPasswords[msg.sender][
			userPasswords[msg.sender].length - 1
		];
		userPasswords[msg.sender].pop();

		emit PasswordDeleted(msg.sender, passwordData.website);
	}

	function getPasswords(
		bytes32 authenticationHash
	)
		external
		view
		onlyRegistered
		onlyAuthenticated(authenticationHash)
		returns (PasswordData[] memory)
	{
		return userPasswords[msg.sender];
	}
}
