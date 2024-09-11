"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShareablePasswordManager from "../../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import { ethers } from "ethers";

const SharedWithMePage = () => {
  const [receivedPasswords, setReceivedPasswords] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>(""); // State for search text
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

          const receivedPasswordData = received.map(
            ([name, encryptedDataHash, sharedBy]: [string, string, string]) => ({
              name,
              encryptedDataHash,
              sharedBy,
            }),
          );

          setReceivedPasswords(receivedPasswordData);
        } catch (error) {
          console.error("Failed to fetch passwords shared with the user:", error);
        }
      }
    };

    fetchReceivedPasswords();
  }, []);

  const handleViewPassword = (id: string, index: number) => {
    router.push(`/sharedwithme/password/${id}/${index}`);
  };

  // Filter passwords based on search text
  const filteredPasswords = receivedPasswords.filter(password =>
    password.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Passwords Shared With Me</h1>

      {/* Search bar for filtering */}
      <div className="max-w-2xl mx-auto mb-4">
        <input
          type="text"
          placeholder="Search passwords..."
          className="input input-bordered w-full"
          value={searchText}
          onChange={e => setSearchText(e.target.value)} // Update search text on change
        />
      </div>

      <div className="max-w-2xl mx-auto">
        {filteredPasswords.length === 0 ? (
          <p className="text-center">No passwords found.</p>
        ) : (
          <div className="overflow-y-auto h-[420px]">
            {" "}
            {/* Scrollable container */}
            {filteredPasswords.map((password, index) => (
              <div key={password.encryptedDataHash} className="bg-base-100 shadow-md rounded-lg p-4 mb-4">
                <h2 className="font-bold">{password.name}</h2>
                <p>Shared by: {password.sharedBy}</p>
                <button
                  className="btn btn-success"
                  onClick={() => handleViewPassword(password.encryptedDataHash, index)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedWithMePage;
