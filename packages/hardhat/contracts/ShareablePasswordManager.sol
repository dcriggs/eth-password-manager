// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UserPasswordManager.sol";

contract ShareablePasswordManager is UserPasswordManager {
	struct SharedPasswordData {
		string name;
		string encryptedDataHash;
		address sharedBy;
		address sharedWith;
	}

	// Mappings to store shared passwords for each user
	mapping(address => address[]) private recipients;
	mapping(address => address[]) private senders;
	mapping(address => uint256) private sentPasswordCount;
	mapping(address => uint256) private receivedPasswordCount;

	// Mapping to track which passwords a user has shared with others
	mapping(address => mapping(address => SharedPasswordData[]))
		private sharedPasswords;

	// Event emitted when a password is shared
	event PasswordShared(address indexed sender, address indexed recipient);

	// Event emitted when a shared password is revoked
	event SharedPasswordRevoked(
		address indexed sender,
		address indexed recipient
	);

	constructor(address _owner) UserPasswordManager(_owner) {}

	// Function to share a password with another registered user
	function sharePassword(
		address recipient,
		string memory name,
		string memory encryptedDataHash
	) external onlyRegistered {
		// Ensure the recipient is a registered user
		require(isUserRegistered(recipient), "Recipient is not registered.");
		require(recipient != msg.sender, "Cannot share with same address.");

		// Create the SharedPasswordData struct and add it to the recipient's shared passwords
		SharedPasswordData memory newPassword = SharedPasswordData(
			name,
			encryptedDataHash,
			msg.sender,
			recipient
		);
		sharedPasswords[msg.sender][recipient].push(newPassword);

		sentPasswordCount[msg.sender]++;
		receivedPasswordCount[recipient]++;

		// Check if the sender is already in the recipient's senders list
		bool senderExists = false;
		for (uint256 i = 0; i < senders[recipient].length; i++) {
			if (senders[recipient][i] == msg.sender) {
				senderExists = true;
				break;
			}
		}
		if (!senderExists) {
			senders[recipient].push(msg.sender);
		}

		// Check if the recipient is already in the sender's recipients list
		bool recipientExists = false;
		for (uint256 i = 0; i < recipients[msg.sender].length; i++) {
			if (recipients[msg.sender][i] == recipient) {
				recipientExists = true;
				break;
			}
		}
		if (!recipientExists) {
			recipients[msg.sender].push(recipient);
		}

		// Emit the event
		emit PasswordShared(msg.sender, recipient);
	}

	// Function to revoke a shared password
	function revokeSharedPassword(
		address recipient,
		string memory name,
		string memory encryptedDataHash
	) external onlyRegistered {
		// Find the password and remove it from the recipient's shared passwords
		SharedPasswordData[] storage recipientPasswords = sharedPasswords[
			msg.sender
		][recipient];
		bool anyRemoved;
		for (uint256 i = 0; i < recipientPasswords.length; i++) {
			if (
				keccak256(abi.encodePacked(recipientPasswords[i].name)) ==
				keccak256(abi.encodePacked(name)) &&
				keccak256(
					abi.encodePacked(recipientPasswords[i].encryptedDataHash)
				) ==
				keccak256(abi.encodePacked(encryptedDataHash))
			) {
				// Remove the password by swapping it with the last element and then popping it
				recipientPasswords[i] = recipientPasswords[
					recipientPasswords.length - 1
				];
				recipientPasswords.pop();
				sentPasswordCount[msg.sender]--;
				receivedPasswordCount[recipient]--;

				// If no passwords are left, update the senders and recipients mappings
				if (recipientPasswords.length == 0) {
					// Remove sender from recipient's senders list
					removeAddressFromList(senders[recipient], msg.sender);
					// Remove recipient from sender's recipients list
					removeAddressFromList(recipients[msg.sender], recipient);
				}

				anyRemoved = true;

				// Emit the event
				emit SharedPasswordRevoked(msg.sender, recipient);
				break;
			}
		}

		if (!anyRemoved) revert("No matching password found.");
	}

	// Helper function to remove an address from an array
	function removeAddressFromList(
		address[] storage list,
		address addrToRemove
	) internal {
		for (uint256 i = 0; i < list.length; i++) {
			if (list[i] == addrToRemove) {
				list[i] = list[list.length - 1];
				list.pop();
				break;
			}
		}
	}

	// Function to retrieve shared passwords that have been sent to a user
	function getSharedPasswordsSent(
		address recipient
	) external view onlyRegistered returns (SharedPasswordData[] memory) {
		return sharedPasswords[msg.sender][recipient];
	}

	// Function to retrieve shared passwords that have been received from a user
	function getSharedPasswordsReceived(
		address sender
	) external view onlyRegistered returns (SharedPasswordData[] memory) {
		return sharedPasswords[sender][msg.sender];
	}

	// Function to retrieve all shared passwords sent by the caller
	function getAllSharedPasswordsSent()
		external
		view
		onlyRegistered
		returns (SharedPasswordData[] memory)
	{
		// Determine the total number of passwords sent
		uint256 totalSentPasswords = sentPasswordCount[msg.sender];

		// Create an array to store the sent passwords
		SharedPasswordData[] memory allSentPasswords = new SharedPasswordData[](
			totalSentPasswords
		);

		uint256 index = 0;
		address[] memory recipientsList = recipients[msg.sender];

		for (uint256 i = 0; i < recipientsList.length; i++) {
			address recipient = recipientsList[i];
			SharedPasswordData[] memory sentPasswords = sharedPasswords[
				msg.sender
			][recipient];

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
		returns (SharedPasswordData[] memory)
	{
		// Determine the total number of passwords received
		uint256 totalReceivedPasswords = receivedPasswordCount[msg.sender];

		// Create an array to store the received passwords
		SharedPasswordData[]
			memory allReceivedPasswords = new SharedPasswordData[](
				totalReceivedPasswords
			);

		uint256 index = 0;
		address[] memory sendersList = senders[msg.sender];

		for (uint256 i = 0; i < sendersList.length; i++) {
			address sender = sendersList[i];
			SharedPasswordData[] memory receivedPasswords = sharedPasswords[
				sender
			][msg.sender];

			for (uint256 j = 0; j < receivedPasswords.length; j++) {
				allReceivedPasswords[index] = receivedPasswords[j];
				index++;
			}
		}

		return allReceivedPasswords;
	}
}
