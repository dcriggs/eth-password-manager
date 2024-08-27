"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShareablePasswordManager from "../../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import { ethers } from "ethers";

const MyPasswordsPage = () => {
  const [myPasswords, setMyPasswords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchMyPasswords = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const passwords = await contract.getPasswords();

        const passwordData = passwords.map(([name, encryptedDataHash]: [string, string]) => ({
          name,
          encryptedDataHash,
        }));

        setMyPasswords(passwordData);
      } catch (error) {
        console.error("Failed to fetch your passwords:", error);
      }
    } else {
      console.error("Please install Metamask!");
    }
  };

  useEffect(() => {
    fetchMyPasswords();
  }, []);

  const handleViewPassword = (id: string) => {
    router.push(`/mypasswords/password/${id}`);
  };

  const handleDeletePassword = async (id: string) => {
    if (!window.ethereum) return;

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
      const contractABI = ShareablePasswordManager.abi;

      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.deletePassword(id);
      await tx.wait();

      fetchMyPasswords();
    } catch (error) {
      console.error("Failed to delete password:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">My Passwords</h1>
      <div className="max-w-2xl mx-auto">
        {myPasswords.length === 0 ? (
          <p className="text-center">No passwords stored yet.</p>
        ) : (
          myPasswords.map((password, index) => (
            <div key={password.encryptedDataHash} className="bg-base-100 shadow-md rounded-lg p-4 mb-4">
              <h2 className="font-bold">{password.name}</h2>
              <div className="flex justify-between mt-4">
                <button color="primary" onClick={() => handleViewPassword(password.encryptedDataHash)}>
                  View Details
                </button>
                <button color="error" onClick={() => handleDeletePassword(index.toString())} disabled={loading}>
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyPasswordsPage;
