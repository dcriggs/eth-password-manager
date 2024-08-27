"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ShareablePasswordManager from "../../../../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import { ethers } from "ethers";

const PasswordDetailPage = () => {
  const { id } = useParams(); // Access the dynamic route parameter
  const router = useRouter();
  const [passwordName, setPasswordName] = useState("");
  const [encryptedDataHash, setEncryptedDataHash] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Fetch password details by ID (dummy data for now)
  useEffect(() => {
    const fetchPasswordDetails = async () => {
      if (window.ethereum && id) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
          const contractABI = ShareablePasswordManager.abi;

          const contract = new ethers.Contract(contractAddress, contractABI, signer);
          const passwordDetails = await contract.getPasswordById(id);

          setPasswordName(passwordDetails.name);
          setEncryptedDataHash(passwordDetails.encryptedDataHash);
        } catch (error) {
          console.error("Failed to fetch password details:", error);
        }
      }
    };

    fetchPasswordDetails();
  }, [id]);

  const handleUpdatePassword = async () => {
    if (window.ethereum && id && newPassword) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const encryptedHash = ethers.sha256(ethers.toUtf8Bytes(newPassword)); // Example encryption, replace with actual

        const tx = await contract.updatePassword(id, encryptedHash);
        await tx.wait();
        console.log("Password updated successfully!");

        router.push("/mypasswords"); // Redirect to passwords page after update
      } catch (error) {
        console.error("Failed to update password:", error);
      }
    } else {
      console.log("Ethereum object not found or new password is empty!");
    }
  };

  const handleDeletePassword = async () => {
    if (window.ethereum && id) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const tx = await contract.deletePassword(id);
        await tx.wait();
        console.log("Password deleted successfully!");

        router.push("/mypasswords"); // Redirect to passwords page after deletion
      } catch (error) {
        console.error("Failed to delete password:", error);
      }
    } else {
      console.log("Ethereum object not found!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Password Details</h1>
      <div className="max-w-md mx-auto bg-base-100 shadow-lg rounded-lg p-6">
        <div className="mb-4">
          <label className="block font-medium mb-2">Name</label>
          <input value={passwordName} disabled className="w-full" />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Encrypted Data Hash</label>
          <input value={encryptedDataHash} disabled className="w-full" />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex space-x-4">
          <button color="primary" onClick={handleUpdatePassword}>
            Update Password
          </button>
          <button color="error" onClick={handleDeletePassword}>
            Delete Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordDetailPage;
