// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserPasswordManager {
	address public owner;

	struct PasswordData {
		string name;
		string encryptedDataHash;
	}

	mapping(address => bool) internal isRegistered;
	mapping(address => string) internal userPublicKeys;
	mapping(address => PasswordData[]) internal userPasswords;

	event UserRegistered(address indexed user);
	event PasswordStored(address indexed user);
	event PasswordDetailsUpdated(address indexed user);
	event PasswordDeleted(address indexed user);

	constructor(address _owner) {
		owner = _owner == address(0) ? msg.sender : _owner; // Default to deployer if _owner is address(0)
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "Not the contract owner.");
		_;
	}

	modifier onlyRegistered() {
		require(isRegistered[msg.sender], "User is not registered.");
		_;
	}

	function isUserRegistered(address user) public view returns (bool) {
		return isRegistered[user];
	}

	// Virtual function to allow overriding in child contracts
	function registerUser(string memory publicKey) external payable virtual {
		require(!isRegistered[msg.sender], "User already registered.");
		require(
			msg.value >= 0.01 ether,
			"Insufficient registration fee. At least 0.01 ETH required."
		);

		// Call the original registerUser logic from the parent contract
		isRegistered[msg.sender] = true;
		userPublicKeys[msg.sender] = publicKey;

		emit UserRegistered(msg.sender);
	}

	function storePassword(
		string memory name,
		string memory encryptedDataHash
	) external onlyRegistered {
		PasswordData memory newPasswordData = PasswordData({
			name: name,
			encryptedDataHash: encryptedDataHash
		});

		userPasswords[msg.sender].push(newPasswordData);

		emit PasswordStored(msg.sender);
	}

	function updatePasswordDetails(
		uint index,
		string memory name,
		string memory encryptedDataHash
	) external onlyRegistered {
		require(index < userPasswords[msg.sender].length, "Invalid index.");

		PasswordData storage passwordData = userPasswords[msg.sender][index];
		passwordData.name = name;
		passwordData.encryptedDataHash = encryptedDataHash;

		emit PasswordDetailsUpdated(msg.sender);
	}

	function deletePassword(uint index) external onlyRegistered {
		require(index < userPasswords[msg.sender].length, "Invalid index.");

		// Move the last element into the place to delete
		userPasswords[msg.sender][index] = userPasswords[msg.sender][
			userPasswords[msg.sender].length - 1
		];
		userPasswords[msg.sender].pop();

		emit PasswordDeleted(msg.sender);
	}

	function getPasswords()
		external
		view
		onlyRegistered
		returns (PasswordData[] memory)
	{
		return userPasswords[msg.sender];
	}

	function getUserPublicKey(
		address user
	) external view onlyRegistered returns (string memory) {
		return userPublicKeys[user];
	}

	function withdraw() external onlyOwner {
		require(
			address(this).balance > 0,
			"No funds available for withdrawal."
		);

		(bool success, ) = owner.call{ value: address(this).balance }("");
		require(success, "Withdrawal failed.");
	}
}
