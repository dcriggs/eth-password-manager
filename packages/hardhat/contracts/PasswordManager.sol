// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UserRegistration.sol";

contract PasswordManager {

    UserRegistration private userRegistration;

    struct PasswordData {
        string website;
        string userName;
        bytes32 hashedPassword;
    }

    mapping(address => PasswordData[]) private userPasswords;

    event PasswordStored(address indexed user, string website);
    event PasswordUpdated(address indexed user, string website);
    event PasswordDeleted(address indexed user, string website);

    constructor(address userRegistrationAddress) {
        userRegistration = UserRegistration(userRegistrationAddress);
    }

    modifier onlyAuthenticated(bytes32 hashedPassword) {
        require(userRegistration.authenticateUser(hashedPassword), "Authentication failed.");
        _;
    }

    function storePassword(
        string memory website,
        string memory userName,
        bytes32 hashedPassword,
        bytes32 authenticationHash
    ) external onlyAuthenticated(authenticationHash) {
        PasswordData memory newPasswordData = PasswordData({
            website: website,
            userName: userName,
            hashedPassword: hashedPassword
        });

        userPasswords[msg.sender].push(newPasswordData);

        emit PasswordStored(msg.sender, website);
    }

    function updatePassword(
        uint index,
        string memory website,
        string memory userName,
        bytes32 newHashedPassword,
        bytes32 authenticationHash
    ) external onlyAuthenticated(authenticationHash) {
        require(index < userPasswords[msg.sender].length, "Invalid index.");

        PasswordData storage passwordData = userPasswords[msg.sender][index];
        passwordData.website = website;
        passwordData.userName = userName;
        passwordData.hashedPassword = newHashedPassword;

        emit PasswordUpdated(msg.sender, website);
    }

    function deletePassword(uint index, bytes32 authenticationHash) external onlyAuthenticated(authenticationHash) {
        require(index < userPasswords[msg.sender].length, "Invalid index.");

        PasswordData memory passwordData = userPasswords[msg.sender][index];

        // Move the last element into the place to delete
        userPasswords[msg.sender][index] = userPasswords[msg.sender][userPasswords[msg.sender].length - 1];
        userPasswords[msg.sender].pop();

        emit PasswordDeleted(msg.sender, passwordData.website);
    }

    function getPasswords(bytes32 authenticationHash) external view onlyAuthenticated(authenticationHash) returns (PasswordData[] memory) {
        return userPasswords[msg.sender];
    }
}
