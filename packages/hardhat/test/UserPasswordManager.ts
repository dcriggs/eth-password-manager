import { expect } from "chai";
import { ethers } from "hardhat";
import { UserPasswordManager } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("UserPasswordManager", function () {
  let userPasswordManager: UserPasswordManager;
  let deployer: SignerWithAddress;
  let user0: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let deployerAddress: string;

  before(async () => {
    [deployer, user0, user1, user2] = await ethers.getSigners();
    deployerAddress = await deployer.getAddress();

    // Deploy UserPasswordManager
    const UserPasswordManagerFactory = await ethers.getContractFactory("UserPasswordManager");
    userPasswordManager = (await UserPasswordManagerFactory.deploy(deployerAddress)) as UserPasswordManager;
    await userPasswordManager.waitForDeployment();
  });

  describe("User Registration", function () {
    it("Should allow a new user to register", async function () {
      const hashedPassword = ethers.encodeBytes32String("securePassword123");

      // Connect the contract instance to the user0 signer
      const userPasswordManagerAsUser = userPasswordManager.connect(user0);

      // Register the user
      await userPasswordManagerAsUser.registerUser(hashedPassword, { value: ethers.parseEther("0.01") });

      // Check if the user is registered
      const isUserRegistered = await userPasswordManagerAsUser.isUserRegistered(user0.address);
      expect(isUserRegistered).to.be.true;
    });

    it("Should revert if the user tries to register again", async function () {
      const hashedPassword = ethers.encodeBytes32String("securePassword123");

      // Connect the contract instance to the user0 signer
      const userPasswordManagerAsUser = userPasswordManager.connect(user0);

      // Attempt to register the same user again
      await expect(
        userPasswordManagerAsUser.registerUser(hashedPassword, { value: ethers.parseEther("0.01") }),
      ).to.be.revertedWith("User already registered.");
    });

    it("Should allow a registered user to update their password", async function () {
      const oldHashedPassword = ethers.encodeBytes32String("securePassword123");
      const newHashedPassword = ethers.encodeBytes32String("newSecurePassword456");

      // Connect the contract instance to the user0 signer
      const userPasswordManagerAsUser = userPasswordManager.connect(user0);

      // Attempt to update the password using the correct old password
      await userPasswordManagerAsUser.updateRegistrationPassword(oldHashedPassword, newHashedPassword);

      // Verify that the password was updated by trying to authenticate with the new password
      const isAuthenticated = await userPasswordManagerAsUser.authenticateUser(newHashedPassword);
      expect(isAuthenticated).to.be.true;

      // Ensure the old password no longer works
      await expect(userPasswordManagerAsUser.authenticateUser(oldHashedPassword)).to.be.revertedWith(
        "Authentication failed.",
      );

      // Change the password back so that the other tests still work
      await userPasswordManagerAsUser.updateRegistrationPassword(newHashedPassword, oldHashedPassword);
    });
  });

  describe("Password Management", function () {
    it("Should allow a registered user to store a password", async function () {
      const hashedPassword = ethers.encodeBytes32String("userPassword123");
      const website = "example.com";
      const userName = "user@example.com";
      const hashedAuthPassword = ethers.encodeBytes32String("securePassword123");

      // Connect the contract instance to the user0 signer
      const userPasswordManagerAsUser = userPasswordManager.connect(user0);

      // Store password
      await userPasswordManagerAsUser.storePassword(website, userName, hashedPassword, hashedAuthPassword);

      // Retrieve stored passwords
      const storedPasswords = await userPasswordManagerAsUser.getPasswords(hashedAuthPassword);

      expect(storedPasswords.length).to.equal(1);
      expect(storedPasswords[0].website).to.equal(website);
      expect(storedPasswords[0].userName).to.equal(userName);
      expect(storedPasswords[0].hashedPassword).to.equal(hashedPassword);
    });

    it("Should revert if a non-registered user tries to store a password", async function () {
      const hashedPassword = ethers.encodeBytes32String("userPassword123");
      const website = "example.com";
      const userName = "user@example.com";

      // Connect the contract instance to the user1 signer
      const userPasswordManagerAsAnotherUser = userPasswordManager.connect(user1);

      await expect(
        userPasswordManagerAsAnotherUser.storePassword(website, userName, hashedPassword, hashedPassword),
      ).to.be.revertedWith("User is not registered.");
    });

    it("Should allow a registered user to update a stored password", async function () {
      const initialPassword = ethers.encodeBytes32String("initialPassword123");
      const updatedPassword = ethers.encodeBytes32String("updatedPassword456");
      const website = "mywebsite.com";
      const userName = "user@mywebsite.com";
      const hashedAuthPassword = ethers.encodeBytes32String("securePassword123");

      // Connect the contract instance to the user0 signer
      const userPasswordManagerAsUser = userPasswordManager.connect(user0);

      // Store initial password
      await userPasswordManagerAsUser.storePassword(website, userName, initialPassword, hashedAuthPassword);

      // Update the password
      await userPasswordManagerAsUser.updatePasswordDetails(
        0, // Index of the password to update
        website,
        userName,
        updatedPassword,
        hashedAuthPassword,
      );

      // Retrieve updated password
      const storedPasswords = await userPasswordManagerAsUser.getPasswords(hashedAuthPassword);

      expect(storedPasswords.length).to.equal(2);
      expect(storedPasswords[0].hashedPassword).to.equal(updatedPassword);
    });

    it("Should revert if a non-registered user tries to update a password", async function () {
      const newHashedPassword = ethers.encodeBytes32String("newPassword456");

      // Connect the contract instance to the user1 signer
      const userPasswordManagerAsAnotherUser = userPasswordManager.connect(user1);

      await expect(
        userPasswordManagerAsAnotherUser.updatePasswordDetails(
          0,
          "newsite.com",
          "newuser@example.com",
          newHashedPassword,
          newHashedPassword,
        ),
      ).to.be.revertedWith("User is not registered.");
    });

    it("Should allow a registered user to delete a stored password", async function () {
      const password1 = ethers.encodeBytes32String("password123");
      const password2 = ethers.encodeBytes32String("password456");
      const website1 = "example.com";
      const website2 = "anotherwebsite.com";
      const userName1 = "user@example.com";
      const userName2 = "user@anotherwebsite.com";
      const hashedAuthPassword = ethers.encodeBytes32String("securePassword123");

      // Connect the contract instance to the user0 signer
      const userPasswordManagerAsUser = userPasswordManager.connect(user0);

      // Store multiple passwords
      await userPasswordManagerAsUser.storePassword(website1, userName1, password1, hashedAuthPassword);
      await userPasswordManagerAsUser.storePassword(website2, userName2, password2, hashedAuthPassword);

      // Delete the first password (index 0)
      await userPasswordManagerAsUser.deletePassword(0, hashedAuthPassword);

      // Retrieve remaining passwords
      const storedPasswords = await userPasswordManagerAsUser.getPasswords(hashedAuthPassword);

      // Expect the remaining password to be the second one (password2)
      expect(storedPasswords.length).to.equal(3);
      expect(storedPasswords[0].hashedPassword).to.equal(password2);
      expect(storedPasswords[0].website).to.equal(website2);
      expect(storedPasswords[0].userName).to.equal(userName2);
    });
  });

  describe("Debugging", function () {
    it("Should debug registration and password retrieval", async function () {
      const hashedPassword = ethers.encodeBytes32String("securePassword123");
      const website = "example.com";
      const userName = "user@example.com";

      // Connect the contract instance to the user2 signer
      const userPasswordManagerAsUser = userPasswordManager.connect(user2);

      // Register the user
      await userPasswordManagerAsUser.registerUser(hashedPassword, { value: ethers.parseEther("0.01") });

      // Check if the user is registered
      const isUserRegistered = await userPasswordManagerAsUser.isUserRegistered(user2.address);
      console.log(`User registered status: ${isUserRegistered}`);

      // Store password
      await userPasswordManagerAsUser.storePassword(website, userName, hashedPassword, hashedPassword);

      // Retrieve stored passwords
      try {
        const storedPasswords = await userPasswordManagerAsUser.getPasswords(hashedPassword);
        console.log(`Stored passwords: ${JSON.stringify(storedPasswords)}`);
      } catch (error) {
        console.error(`Error retrieving passwords: ${error.message}`);
      }
    });
  });
});
