import { expect } from "chai";
import { ethers } from "hardhat";
import { UserRegistration, PasswordManager } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PasswordManager", function () {
  let userRegistration: UserRegistration;
  let passwordManager: PasswordManager;
  let deployer: SignerWithAddress;
  let user: SignerWithAddress;
  let deployerAddress: string;

  before(async () => {
    [deployer, user] = await ethers.getSigners(); // ignore getSigners error, it exists.
    deployerAddress = await deployer.getAddress();

    // Deploy UserRegistration
    const UserRegistrationFactory = await ethers.getContractFactory("UserRegistration");
    userRegistration = (await UserRegistrationFactory.deploy(deployerAddress)) as UserRegistration;
    await userRegistration.waitForDeployment();
    const userRegistrationAddress = await userRegistration.getAddress();

    // Deploy PasswordManager with address of UserRegistration
    const PasswordManagerFactory = await ethers.getContractFactory("PasswordManager");
    passwordManager = (await PasswordManagerFactory.deploy(userRegistrationAddress)) as PasswordManager;
    await passwordManager.waitForDeployment();

    // Register the user
    const hashedPassword = ethers.encodeBytes32String("securePassword123");
    const userRegistrationAsUser = userRegistration.connect(user);
    await userRegistrationAsUser.registerUser(hashedPassword);
    const userAddress = await user.getAddress();

    // Verify user is registered
    const isUserRegistered = await userRegistrationAsUser.authenticateUser(userAddress, hashedPassword);
    expect(isUserRegistered).to.be.true;
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await passwordManager.getAddress()).to.be.properAddress;
    });
  });

  describe("User Registration", function () {
    it("Should revert if the user is already registered", async function () {
      const hashedPassword = ethers.encodeBytes32String("securePassword123");

      // Connect the contract instance to the user signer
      const userRegistrationAsUser = userRegistration.connect(user);

      // Attempt to register the same user again
      await expect(userRegistrationAsUser.registerUser(hashedPassword)).to.be.revertedWith("User already registered.");
    });
  });

  describe("Password Management", function () {
    it("Should allow a user to store a password", async function () {
      const website = "example.com";
      const userName = "testUser";
      const hashedPassword = ethers.encodeBytes32String("securePassword123");
      const authenticationHash = hashedPassword;

      // Connect the contract instance to the user signer
      const passwordManagerAsUser = passwordManager.connect(user);

      // Store a password
      await passwordManagerAsUser.storePassword(website, userName, hashedPassword, authenticationHash);

      // Retrieve passwords and verify
      const passwords = await passwordManagerAsUser.getPasswords(authenticationHash);
      expect(passwords.length).to.equal(1);
      expect(passwords[0].website).to.equal(website);
      expect(passwords[0].userName).to.equal(userName);
      expect(passwords[0].hashedPassword).to.equal(hashedPassword);
    });

    it("Should update a user's password", async function () {
      const website = "example.com";
      const userName = "testUser";
      const newHashedPassword = ethers.encodeBytes32String("newSecurePassword123");
      const authenticationHash = ethers.encodeBytes32String("securePassword123");

      // Connect the contract instance to the user signer
      const passwordManagerAsUser = passwordManager.connect(user);

      // Store a password first
      await passwordManagerAsUser.storePassword(
        website,
        userName,
        ethers.encodeBytes32String("securePassword123"),
        authenticationHash,
      );

      // Update the password
      await passwordManagerAsUser.updatePassword(0, website, userName, newHashedPassword, authenticationHash);

      // Retrieve passwords and verify
      const passwords = await passwordManagerAsUser.getPasswords(authenticationHash);
      expect(passwords.length).to.equal(2);
      expect(passwords[0].website).to.equal(website);
      expect(passwords[0].userName).to.equal(userName);
      expect(passwords[0].hashedPassword).to.equal(newHashedPassword);
    });

    it("Should delete a user's password", async function () {
      const website = "example.com";
      const userName = "testUser";
      const hashedPassword = ethers.encodeBytes32String("securePassword123");
      const authenticationHash = ethers.encodeBytes32String("securePassword123");

      // Connect the contract instance to the user signer
      const passwordManagerAsUser = passwordManager.connect(user);

      // Store a password first
      await passwordManagerAsUser.storePassword(website, userName, hashedPassword, authenticationHash);

      // Retrieve passwords
      const passwords = await passwordManagerAsUser.getPasswords(authenticationHash);
      expect(passwords.length).to.equal(3);

      // Delete the password and verify
      await passwordManagerAsUser.deletePassword(0, authenticationHash);
      const passwordsUpdated = await passwordManagerAsUser.getPasswords(authenticationHash);
      expect(passwordsUpdated.length).to.equal(2);
    });

    it("Should revert if authentication fails", async function () {
      const website = "example.com";
      const userName = "testUser";
      const hashedPassword = ethers.encodeBytes32String("securePassword123");
      const wrongAuthenticationHash = ethers.encodeBytes32String("wrongPassword");

      // Connect the contract instance to the user signer
      const passwordManagerAsUser = passwordManager.connect(user);

      // Attempt to store a password with incorrect authentication hash
      await expect(
        passwordManagerAsUser.storePassword(website, userName, hashedPassword, wrongAuthenticationHash),
      ).to.be.revertedWith("Authentication failed.");
    });
  });
});
