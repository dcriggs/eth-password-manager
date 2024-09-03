"use client";

import React, { useState } from "react";
import ShareablePasswordManager from "../../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import { pinJSONToIPFS } from "../../components/custom/pinataService";
import * as sigUtil from "@metamask/eth-sig-util";
import { ethers } from "ethers";

const SharePasswordPage = () => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function encryptPassword(publicKey: string, password: string | null) {
    const encryptedData = sigUtil.encrypt({
      publicKey: publicKey,
      data: password,
      version: "x25519-xsalsa20-poly1305",
    });
    return encryptedData;
  }

  const uploadDataToIPFS = async (encryptedData: string) => {
    try {
      // Use await to wait for the promise to resolve and get the IPFS hash
      const hash = await pinJSONToIPFS(encryptedData);

      // Now you can use the IPFS hash returned by the function
      console.log("Uploaded to IPFS with hash:", hash);

      return hash;
    } catch (error) {
      // If an error occurs, it will be caught here
      console.error("Failed to upload to IPFS:", error);
    }
  };

  const handleSharePassword = async (event: React.FormEvent) => {
    event.preventDefault();

    // Create the JSON object for encryption
    const encodedData = JSON.stringify({
      username: username,
      password: password,
      website: website,
    });

    // Proceed to interact with the smart contract to share the password
    if (window.ethereum) {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Make sure the recipient is registered
        const recipientIsRegistered = await contract.isUserRegistered(recipientAddress);
        if (!recipientIsRegistered) {
          window.alert("Recipient is not registered.");
          return;
        }

        // Get the recipient's public key from the smart contract
        const recipientPublicKey = await contract.getUserPublicKey(recipientAddress);

        // Encrypt the encodedData using the public key
        const encryptedData = encryptPassword(recipientPublicKey, encodedData);

        // Upload the encrypted data to IPFS with Pinata; get the hash in return
        const returnedHash = await uploadDataToIPFS(JSON.stringify(encryptedData));

        // Interact with the smart contract to share the password
        const tx = await contract.sharePassword(recipientAddress, name, returnedHash);
        await tx.wait();

        setMessage("Password shared successfully!");
        // Reset form fields after submission
        setRecipientAddress("");
        setName("");
        setUsername("");
        setPassword("");
        setWebsite("");
      } catch (error) {
        console.error("Failed to share password:", error);
        setMessage("Failed to share password.");
      } finally {
        setLoading(false);
      }
    } else {
      setMessage("Please install MetaMask!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Share Password</h1>
      <div className="max-w-lg mx-auto bg-base-100 shadow-md rounded-lg p-6">
        <form onSubmit={handleSharePassword}>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2 text-center">Unencrypted Information</h2>
            <label className="block text-sm font-bold mb-2" htmlFor="recipientAddress">
              Recipient Address
            </label>
            <input
              type="text"
              id="recipientAddress"
              value={recipientAddress}
              onChange={e => setRecipientAddress(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter recipient's Ethereum address"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter a name for the password"
              required
            />
          </div>

          <hr className="my-4" />

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2 text-center">Encrypted Information</h2>
            <label className="block text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter password"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="website">
              Website
            </label>
            <input
              type="text"
              id="website"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter website URL"
              required
            />
          </div>

          <div className="flex items-center justify-center">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Sharing..." : "Share Password"}
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default SharePasswordPage;
