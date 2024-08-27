"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShareablePasswordManager from "../../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import { ethers } from "ethers";

const SharedWithOthersPage = () => {
  const [sharedPasswords, setSharedPasswords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchSharedPasswords = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const shared = await contract.getAllSharedPasswordsSent();

        setSharedPasswords(shared);
      } catch (error) {
        console.error("Failed to fetch shared passwords:", error);
      }
    }
  };

  useEffect(() => {
    fetchSharedPasswords();
  }, []);

  const handleViewPassword = (id: string) => {
    router.push(`/sharedwithothers/password/${id}`);
  };

  const handleRevokePassword = async (sharedWith: string, name: string, encryptedDataHash: string) => {
    if (!window.ethereum) return;

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
      const contractABI = ShareablePasswordManager.abi;

      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Assuming you have a function `revokeSharedPassword` in your contract to revoke a password
      const tx = await contract.revokeSharedPassword(sharedWith, name, encryptedDataHash); // Replace with actual parameters later
      await tx.wait();

      fetchSharedPasswords();
    } catch (error) {
      console.error("Failed to revoke password:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Passwords Shared With Others</h1>
      <div className="max-w-2xl mx-auto">
        {sharedPasswords.length === 0 ? (
          <p className="text-center">No passwords shared with others yet.</p>
        ) : (
          sharedPasswords.map(password => (
            <div key={password.encryptedDataHash} className="bg-base-100 shadow-md rounded-lg p-4 mb-4">
              <h2 className="font-bold">{password.name}</h2>
              <p>Shared with: {password.sharedWith}</p>
              <div className="flex justify-between mt-4">
                <button color="primary" onClick={() => handleViewPassword(password.encryptedDataHash)}>
                  View Details
                </button>
                <button
                  color="error"
                  onClick={() => handleRevokePassword(password.sharedWith, password.name, password.encryptedDataHash)}
                  disabled={loading}
                >
                  {loading ? "Revoking..." : "Revoke"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SharedWithOthersPage;
