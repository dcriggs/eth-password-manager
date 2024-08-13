// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UserPasswordManager.sol";

contract ShareablePasswordManager is UserPasswordManager {
	// Struct to hold password details
	struct Password {
		string website;
		string username;
		string encryptedPassword;
	}

	// Mappings to store passwords for each user
	mapping(address => Password[]) private passwords;
	mapping(address => address[]) private recipients;
	mapping(address => address[]) private senders;
	mapping(address => uint256) private sentPasswordCount;
	mapping(address => uint256) private receivedPasswordCount;

	// Mapping to track which passwords a user has shared with others
	mapping(address => mapping(address => Password[])) private sharedPasswords;

	// Event emitted when a password is shared
	event PasswordShared(
		address indexed sender,
		address indexed recipient,
		string website,
		string username
	);

	// Event emitted when a shared password is revoked
	event SharedPasswordRevoked(
		address indexed sender,
		address indexed recipient,
		string website,
		string username
	);

	constructor(address _owner) UserPasswordManager(_owner) {}

	// Function to share a password with another registered user
	function sharePassword(
		address recipient,
		string memory website,
		string memory username,
		string memory encryptedPassword
	) external onlyRegistered {
		// Ensure the recipient is a registered user
		require(isUserRegistered(recipient), "Recipient is not registered.");

		// Create the Password struct and add it to the recipient's shared passwords
		Password memory newPassword = Password(
			website,
			username,
			encryptedPassword
		);
		sharedPasswords[msg.sender][recipient].push(newPassword);
		sentPasswordCount[msg.sender]++;
		receivedPasswordCount[recipient]++;

		// Emit the event
		emit PasswordShared(msg.sender, recipient, website, username);
	}

	// Function to retrieve shared passwords that have been received from a user
	function getSharedPasswordsReceived(
		address sender
	) external view onlyRegistered returns (Password[] memory) {
		return sharedPasswords[sender][msg.sender];
	}

	// Function to retrieve shared passwords that have been sent to a user
	function getSharedPasswordsSent(
		address recipient
	) external view onlyRegistered returns (Password[] memory) {
		return sharedPasswords[msg.sender][recipient];
	}

	// Function to retrieve all shared passwords sent by the caller
	function getAllSharedPasswordsSent()
		external
		view
		onlyRegistered
		returns (Password[] memory)
	{
		// Determine the total number of passwords sent
		uint256 totalSentPasswords = sentPasswordCount[msg.sender];

		// Create an array to store the sent passwords
		Password[] memory allSentPasswords = new Password[](totalSentPasswords);

		uint256 index = 0;
		address[] memory recipientsList = recipients[msg.sender]; // This should be a state variable storing recipients

		for (uint256 i = 0; i < recipientsList.length; i++) {
			address recipient = recipientsList[i];
			Password[] memory sentPasswords = sharedPasswords[msg.sender][
				recipient
			];

			for (uint256 j = 0; j < sentPasswords.length; j++) {
				allSentPasswords[index] = sentPasswords[j];
				index++;
			}
		}

		return allSentPasswords;
	}

	// Function to retrieve all shared passwords received by the caller
	function getAllSharedPasswordsReceived()
		external
		view
		onlyRegistered
		returns (Password[] memory)
	{
		// Determine the total number of passwords received
		uint256 totalReceivedPasswords = receivedPasswordCount[msg.sender];

		// Create an array to store the received passwords
		Password[] memory allReceivedPasswords = new Password[](
			totalReceivedPasswords
		);

		uint256 index = 0;
		address[] memory sendersList = senders[msg.sender]; // This should be a state variable storing senders

		for (uint256 i = 0; i < sendersList.length; i++) {
			address sender = sendersList[i];
			Password[] memory receivedPasswords = sharedPasswords[sender][
				msg.sender
			];

			for (uint256 j = 0; j < receivedPasswords.length; j++) {
				allReceivedPasswords[index] = receivedPasswords[j];
				index++;
			}
		}

		return allReceivedPasswords;
	}

	// Function to revoke a shared password
	function revokeSharedPassword(
		address recipient,
		string memory website,
		string memory username
	) external onlyRegistered {
		// Find the password and remove it from the recipient's shared passwords
		Password[] storage recipientPasswords = sharedPasswords[msg.sender][
			recipient
		];
		for (uint i = 0; i < recipientPasswords.length; i++) {
			if (
				keccak256(abi.encodePacked(recipientPasswords[i].website)) ==
				keccak256(abi.encodePacked(website)) &&
				keccak256(abi.encodePacked(recipientPasswords[i].username)) ==
				keccak256(abi.encodePacked(username))
			) {
				// Remove the password by swapping it with the last element and then popping it
				recipientPasswords[i] = recipientPasswords[
					recipientPasswords.length - 1
				];
				recipientPasswords.pop();
				sentPasswordCount[msg.sender]--;
				receivedPasswordCount[recipient]--;

				// Emit the event
				emit SharedPasswordRevoked(
					msg.sender,
					recipient,
					website,
					username
				);
				break;
			}
		}
	}

	// Function to get the count of passwords shared with a specific recipient
	function getSharedPasswordCount(
		address recipient
	) external view onlyRegistered returns (uint256) {
		return sharedPasswords[msg.sender][recipient].length;
	}
}
