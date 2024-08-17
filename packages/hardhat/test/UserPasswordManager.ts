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
      // Connect the contract instance to the user0 signer
      const userPasswordManagerAsUser = userPasswordManager.connect(user0);

      // Register the user
      await userPasswordManagerAsUser.registerUser("fakepublickey", { value: ethers.parseEther("0.01") });

      // Check if the user is registered
      const isUserRegistered = await userPasswordManagerAsUser.isUserRegistered(user0.address);
      expect(isUserRegistered).to.equal(true);
    });

    it("Should revert if the user tries to register again", async function () {
      // Connect the contract instance to the user0 signer
      const userPasswordManagerAsUser = userPasswordManager.connect(user0);

      // Attempt to register the same user again
      await expect(
        userPasswordManagerAsUser.registerUser("fakepublickey", { value: ethers.parseEther("0.01") }),
      ).to.be.revertedWith("User already registered.");
    });
  });

  describe("Password Management", function () {
    it("Should allow a registered user to store a password", async function () {
      const encryptedDataHash = "userPassword123";
      const name = "example.com";

      // Connect the contract instance to the user0 signer
      const userPasswordManagerAsUser = userPasswordManager.connect(user0);

      // Store password
      await userPasswordManagerAsUser.storePassword(name, encryptedDataHash);

      // Retrieve stored passwords
      const storedPasswords = await userPasswordManagerAsUser.getPasswords();

      expect(storedPasswords.length).to.equal(1);
      expect(storedPasswords[0].name).to.equal(name);
      expect(storedPasswords[0].encryptedDataHash).to.equal(encryptedDataHash);
    });

    it("Should revert if a non-registered user tries to store a password", async function () {
      const encryptedDataHash = "userPassword123";
      const name = "example.com";

      // Connect the contract instance to the user1 signer
      const userPasswordManagerAsAnotherUser = userPasswordManager.connect(user1);

      await expect(userPasswordManagerAsAnotherUser.storePassword(name, encryptedDataHash)).to.be.revertedWith(
        "User is not registered.",
      );
    });

    it("Should allow a registered user to update a stored password", async function () {
      const initialPassword = "initialPassword123";
      const updatedPassword = "updatedPassword456";
      const name = "mywebsite.com";

      // Connect the contract instance to the user0 signer
      const userPasswordManagerAsUser = userPasswordManager.connect(user0);

      // Store initial password
      await userPasswordManagerAsUser.storePassword(name, initialPassword);

      // Update the password
      await userPasswordManagerAsUser.updatePasswordDetails(
        0, // Index of the password to update
        name,
        updatedPassword,
      );

      // Retrieve updated password
      const storedPasswords = await userPasswordManagerAsUser.getPasswords();

      expect(storedPasswords.length).to.equal(2);
      expect(storedPasswords[0].encryptedDataHash).to.equal(updatedPassword);
    });

    it("Should revert if a non-registered user tries to update a password", async function () {
      const newHashedPassword = "newPassword456";

      // Connect the contract instance to the user1 signer
      const userPasswordManagerAsAnotherUser = userPasswordManager.connect(user1);

      await expect(
        userPasswordManagerAsAnotherUser.updatePasswordDetails(0, "newsite.com", newHashedPassword),
      ).to.be.revertedWith("User is not registered.");
    });

    it("Should allow a registered user to delete a stored password", async function () {
      const password1 = "password123";
      const password2 = "password456";
      const website1 = "example.com";
      const website2 = "anotherwebsite.com";

      // Connect the contract instance to the user0 signer
      const userPasswordManagerAsUser = userPasswordManager.connect(user0);

      // Store multiple passwords
      await userPasswordManagerAsUser.storePassword(website1, password1);
      await userPasswordManagerAsUser.storePassword(website2, password2);

      // Delete the first password (index 0)
      await userPasswordManagerAsUser.deletePassword(0);

      // Retrieve remaining passwords
      const storedPasswords = await userPasswordManagerAsUser.getPasswords();

      // Expect the remaining password to be the second one (password2)
      expect(storedPasswords.length).to.equal(3);
      expect(storedPasswords[0].encryptedDataHash).to.equal(password2);
      expect(storedPasswords[0].name).to.equal(website2);
    });
  });

  describe("Debugging", function () {
    it("Should debug registration and password retrieval", async function () {
      const encryptedDataHash = "securePassword123";
      const name = "example.com";

      // Connect the contract instance to the user2 signer
      const userPasswordManagerAsUser = userPasswordManager.connect(user2);

      // Register the user
      await userPasswordManagerAsUser.registerUser("fakepublickey", { value: ethers.parseEther("0.01") });

      // Check if the user is registered
      const isUserRegistered = await userPasswordManagerAsUser.isUserRegistered(user2.address);
      console.log(`User registered status: ${isUserRegistered}`);

      // Store password
      await userPasswordManagerAsUser.storePassword(name, encryptedDataHash);

      // Retrieve stored passwords
      try {
        const storedPasswords = await userPasswordManagerAsUser.getPasswords();
        console.log(`Stored passwords: ${JSON.stringify(storedPasswords)}`);
      } catch (error) {
        console.error(`Error retrieving passwords: ${error.message}`);
      }
    });
  });
});
