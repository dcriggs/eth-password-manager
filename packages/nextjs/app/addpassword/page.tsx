"use client";

import React, { useState } from "react";
import ShareablePasswordManager from "../../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import { pinJSONToIPFS } from "../../components/custom/pinataService";
import * as sigUtil from "@metamask/eth-sig-util";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

const AddPasswordPage = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [hash, setHash] = useState("");
  const { address: connectedAddress } = useAccount();

  // Function to trigger the modal
  const showModal = () => {
    const checkbox = document.getElementById("my_modal_7") as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = true;
    }
  };

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
      const hash = await pinJSONToIPFS(encryptedData);
      return hash;
    } catch (error) {
      console.error("Failed to upload to IPFS:", error);
    }
  };

  const handleAddPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    const encodedData = JSON.stringify({
      username: username,
      password: password,
      website: website,
    });

    if (window.ethereum) {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const userPublicKey = await contract.getUserPublicKey(connectedAddress);
        const encryptedData = encryptPassword(userPublicKey, encodedData);
        const returnedHash = await uploadDataToIPFS(JSON.stringify(encryptedData));
        setHash(returnedHash ? returnedHash : "");

        const tx = await contract.storePassword(name, returnedHash);
        await tx.wait();

        setMessage("Login added successfully!");
        setName("");
        setUsername("");
        setPassword("");
        setWebsite("");

        // Show the modal when the login is successfully added
        showModal();
      } catch (error) {
        console.error("Failed to store login:", error);
        setMessage("Failed to store login.");
      } finally {
        setLoading(false);
      }
    } else {
      setMessage("Please install MetaMask!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Add New Login</h1>
      <div className="max-w-lg mx-auto bg-base-100 shadow-md rounded-lg p-6">
        <form onSubmit={handleAddPassword}>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2 text-center">Unencrypted Information</h2>
            <label className="block text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter a name for the login"
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
              Website URL
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
              {loading ? "Adding..." : "Add Login"}
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>

      {/* Hidden modal section */}
      <input type="checkbox" id="my_modal_7" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Success!</h3>
          <p className="py-4">Login was added successfully! Click anywhere to continue.</p>
          <p className="py-4 text-sm italic">Hash: {hash}</p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <a href="/mypasswords">
              <button className="btn btn-success">View My Logins</button>
            </a>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="my_modal_7">
          Close
        </label>
      </div>
    </div>
  );
};

export default AddPasswordPage;
