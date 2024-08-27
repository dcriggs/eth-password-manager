"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShareablePasswordManager from "../../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import { ethers } from "ethers";

const SharedWithMePage = () => {
  const [receivedPasswords, setReceivedPasswords] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchReceivedPasswords = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
          const contractABI = ShareablePasswordManager.abi;

          const contract = new ethers.Contract(contractAddress, contractABI, signer);
          const received = await contract.getAllSharedPasswordsReceived();

          setReceivedPasswords(received);
        } catch (error) {
          console.error("Failed to fetch passwords shared with the user:", error);
        }
      }
    };

    fetchReceivedPasswords();
  }, []);

  const handleViewPassword = (id: string) => {
    router.push(`/password/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Passwords Shared With Me</h1>
      <div className="max-w-2xl mx-auto">
        {receivedPasswords.length === 0 ? (
          <p className="text-center">No passwords shared with you yet.</p>
        ) : (
          receivedPasswords.map(password => (
            <div key={password.encryptedDataHash} className="bg-base-100 shadow-md rounded-lg p-4 mb-4">
              <h2 className="font-bold">{password.name}</h2>
              <p>Shared by: {password.sharedBy}</p>
              <button color="primary" onClick={() => handleViewPassword(password.encryptedDataHash)}>
                View Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SharedWithMePage;
