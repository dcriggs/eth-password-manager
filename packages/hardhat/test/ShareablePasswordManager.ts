import { expect } from "chai";
import { ethers } from "hardhat";
import { ShareablePasswordManager, ShareablePasswordManager__factory } from "../typechain-types";

describe("ShareablePasswordManager", function () {
  let shareablePasswordManager: ShareablePasswordManager;
  let owner: any;
  let user1: any;
  let user2: any;
  let nonRegisteredUser: any;
  let deployerAddress: string;
  let nonRegisteredUserAddress: string;

  beforeEach(async function () {
    [owner, user1, user2, nonRegisteredUser] = await ethers.getSigners();
    deployerAddress = await owner.getAddress();
    nonRegisteredUserAddress = await nonRegisteredUser.getAddress();

    const ShareablePasswordManagerFactory: ShareablePasswordManager__factory =
      await ethers.getContractFactory("ShareablePasswordManager");
    shareablePasswordManager = await ShareablePasswordManagerFactory.deploy(deployerAddress);
    await shareablePasswordManager.waitForDeployment();

    // Register the users
    await shareablePasswordManager
      .connect(owner)
      .registerUser(ethers.encodeBytes32String("password123"), { value: ethers.parseEther("0.01") });
    await shareablePasswordManager
      .connect(user1)
      .registerUser(ethers.encodeBytes32String("password456"), { value: ethers.parseEther("0.01") });
    await shareablePasswordManager
      .connect(user2)
      .registerUser(ethers.encodeBytes32String("password789"), { value: ethers.parseEther("0.01") });
  });

  it("Should allow a user to share a password with another user", async function () {
    const name = "example.com";
    const encryptedDataHash = "encryptedPassword1";

    // Share a password from owner to user1
    await shareablePasswordManager.connect(owner).sharePassword(user1.address, name, encryptedDataHash);

    // Retrieve the shared passwords for user1
    const sharedPasswords = await shareablePasswordManager.connect(user1).getSharedPasswordsReceived(owner.address);

    // Ensure the password was shared correctly
    expect(sharedPasswords.length).to.equal(1);
    expect(sharedPasswords[0].name).to.equal(name);
    expect(sharedPasswords[0].encryptedDataHash).to.equal(encryptedDataHash);
  });

  it("Should allow a user to revoke a shared password", async function () {
    const name = "example.com";
    const encryptedDataHash = "encryptedPassword1";

    // Share a password from owner to user1
    await shareablePasswordManager.connect(owner).sharePassword(user1.address, name, encryptedDataHash);

    // Revoke the shared password
    await shareablePasswordManager.connect(owner).revokeSharedPassword(user1.address, name, encryptedDataHash);

    // Retrieve the shared passwords for user1
    const sharedPasswords = await shareablePasswordManager.connect(user1).getSharedPasswordsReceived(owner.address);

    // Ensure the password was revoked
    expect(sharedPasswords.length).to.equal(0);
  });

  it("Should return the correct number of shared passwords", async function () {
    const name1 = "example1.com";
    const encryptedDataHash1 = "encryptedPassword1";

    const name2 = "example2.com";
    const encryptedDataHash2 = "encryptedPassword2";

    // Share two passwords from owner to user1
    await shareablePasswordManager.connect(owner).sharePassword(user1.address, name1, encryptedDataHash1);
    await shareablePasswordManager.connect(owner).sharePassword(user1.address, name2, encryptedDataHash2);

    // Get the shared password count
    const sharedPasswords = await shareablePasswordManager.connect(user1).getSharedPasswordsReceived(owner.address);

    // Verify that both passwords are shared
    expect(sharedPasswords.length).to.equal(2);
    expect(sharedPasswords[0].name).to.equal(name1);
    expect(sharedPasswords[1].name).to.equal(name2);
  });

  it("Should not allow a non-registered user to share a password", async function () {
    const name = "example.com";
    const encryptedDataHash = "encryptedPassword1";

    // Try to share a password from a non-registered user
    await expect(
      shareablePasswordManager.connect(nonRegisteredUser).sharePassword(user1.address, name, encryptedDataHash),
    ).to.be.revertedWith("User is not registered.");
  });

  it("Should not allow sharing a password with a non-registered user", async function () {
    const name = "example.com";
    const encryptedDataHash = "encryptedPassword1";

    // Try to share a password with a non-registered user
    await expect(
      shareablePasswordManager.connect(owner).sharePassword(nonRegisteredUserAddress, name, encryptedDataHash),
    ).to.be.revertedWith("Recipient is not registered.");
  });
});
