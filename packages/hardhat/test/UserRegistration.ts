import { expect } from "chai";
import { ethers } from "hardhat";
import { UserRegistration } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("UserRegistration", function () {
  let userRegistration: UserRegistration;
  let deployer: SignerWithAddress;
  let user: SignerWithAddress;
  let deployerAddress: string;

  before(async () => {
    [deployer, user] = await ethers.getSigners(); // ignore getSigners error, it exists.
    deployerAddress = await deployer.getAddress();

    const UserRegistrationFactory = await ethers.getContractFactory("UserRegistration");
    userRegistration = (await UserRegistrationFactory.deploy()) as UserRegistration;
    await userRegistration.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await userRegistration.getAddress()).to.be.properAddress;
    });

    it("Should set the deployer as the owner", async function () {
      const owner = await userRegistration.owner();
      expect(owner).to.equal(deployerAddress);
    });
  });

  describe("User Registration", function () {
    it("Should allow a user to register with a hashed password", async function () {
      const hashedPassword = ethers.encodeBytes32String("securePassword123");

      // Connect the contract instance to the user signer
      const userRegistrationAsUser = userRegistration.connect(user);

      // Register as the user
      await userRegistrationAsUser.registerUser(hashedPassword);

      const isUserRegistered = await userRegistrationAsUser.authenticateUser(hashedPassword);
      expect(isUserRegistered).to.be.true;
    });

    it("Should revert if the user is already registered", async function () {
      const hashedPassword = ethers.encodeBytes32String("securePassword123");

      // Connect the contract instance to the user signer
      const userRegistrationAsUser = userRegistration.connect(user);

      // Attempt to register the same user again
      await expect(userRegistrationAsUser.registerUser(hashedPassword)).to.be.revertedWith("User already registered.");
    });
  });

  describe("User Authentication", function () {
    it("Should return true for correct password", async function () {
      const hashedPassword = ethers.encodeBytes32String("securePassword123");

      // Connect the contract instance to the user signer
      const userRegistrationAsUser = userRegistration.connect(user);

      const isUserRegistered = await userRegistrationAsUser.authenticateUser(hashedPassword);
      expect(isUserRegistered).to.be.true;
    });

    it("Should return false for incorrect password", async function () {
      const wrongHashedPassword = ethers.encodeBytes32String("wrongPassword");

      // Connect the contract instance to the user signer
      const userRegistrationAsUser = userRegistration.connect(user);

      const isUserRegistered = await userRegistrationAsUser.authenticateUser(wrongHashedPassword);
      expect(isUserRegistered).to.be.false;
    });
  });
});
