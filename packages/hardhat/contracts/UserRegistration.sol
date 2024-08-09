// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserRegistration {

    mapping(address => bytes32) private userToHashedPassword;
    mapping(address => bool) private isRegistered;

    event UserRegistered(address indexed user);
    event PasswordUpdated(address indexed user);

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

    function authenticateUser(bytes32 hashedPassword) external view returns (bool) {
        require(isRegistered[msg.sender], "User is not registered.");
        return userToHashedPassword[msg.sender] == hashedPassword;
    }

    function updatePassword(bytes32 newHashedPassword) external onlyRegistered {
        require(newHashedPassword != bytes32(0), "Invalid new password.");

        userToHashedPassword[msg.sender] = newHashedPassword;

        emit PasswordUpdated(msg.sender);
    }
}
