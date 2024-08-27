"use client";

import React, { useState } from "react";
import ShareablePasswordManager from "../../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import { ethers } from "ethers";

const SharePasswordPage = () => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSharePassword = async (event: React.FormEvent) => {
    event.preventDefault();

    // Create the JSON object for encryption
    const encryptedData = JSON.stringify({
      username,
      password,
      website,
    });

    // Simulate encryption and Pinata upload process
    // You should replace this part with your actual encryption logic and Pinata API call
    const encryptedDataHash = await mockEncryptAndUploadToPinata(encryptedData);

    if (!encryptedDataHash) {
      setMessage("Failed to encrypt and upload password data.");
      return;
    }

    // Proceed to interact with the smart contract to share the password
    if (window.ethereum) {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Interact with the smart contract to share the password
        const tx = await contract.sharePassword(recipientAddress, name, encryptedDataHash);
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

  // Mock function for encryption and upload to Pinata (replace with real implementation)
  const mockEncryptAndUploadToPinata = async (data: string) => {
    // Simulate encryption and getting a hash from Pinata
    return new Promise(resolve => {
      setTimeout(() => {
        const simulatedHash = "0x" + ethers.keccak256(ethers.toUtf8Bytes(data)).substring(2);
        resolve(simulatedHash);
      }, 1000);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Share Password</h1>
      <div className="max-w-lg mx-auto bg-base-100 shadow-md rounded-lg p-6">
        <form onSubmit={handleSharePassword}>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Unencrypted Information</h2>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recipientAddress">
              Recipient Address
            </label>
            <input
              type="text"
              id="recipientAddress"
              value={recipientAddress}
              onChange={e => setRecipientAddress(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter recipient's Ethereum address"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter a name for the password"
              required
            />
          </div>

          <hr className="my-4" />

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Encrypted Information</h2>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter password"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="website">
              Website
            </label>
            <input
              type="text"
              id="website"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter website URL"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
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
