"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ShareablePasswordManager from "../../../../../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import { ethers } from "ethers";

const PasswordDetailPage = () => {
  const params = useParams(); // Access the route parameters
  const { id, index } = params; // Get 'id' from params
  const [encryptedDataHash, setEncryptedDataHash] = useState("");
  const [name, setName] = useState("");

  const fetchSharedPasswords = useCallback(async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const passwords = await contract.getAllSharedPasswordsSent();

        const passwordData = passwords.map(([name, encryptedDataHash]: [string, string]) => ({
          name,
          encryptedDataHash,
        }));

        setName(passwordData[Number(index)].name);
      } catch (error) {
        console.error("Failed to fetch your passwords:", error);
      }
    } else {
      console.error("Please install Metamask!");
    }
  }, [index]);

  useEffect(() => {
    setEncryptedDataHash(id.toString());
    fetchSharedPasswords();
  }, [id, fetchSharedPasswords]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Login Details</h1>
      <h4 className="text-center mb-8">Only the recipient can decrypt this data.</h4>
      <div className="max-w-md mx-auto bg-base-100 shadow-lg rounded-lg p-6">
        <div className="mb-4">
          <label className="block font-medium mb-2">Name</label>
          <input value={name} disabled className="w-full" />
        </div>
        <div className="mb-4">
          <br />
          <a href={`https://gateway.pinata.cloud/ipfs/` + encryptedDataHash}>
            <button className="btn">View on IPFS</button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PasswordDetailPage;
