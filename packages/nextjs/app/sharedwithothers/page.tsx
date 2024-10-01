"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShareablePasswordManager from "../../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import { ethers } from "ethers";

const SharedWithOthersPage = () => {
  const [sharedPasswords, setSharedPasswords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState<string>(""); // State for search text
  const router = useRouter();

  const fetchSharedPasswords = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x90b8Bbe202Bc7ae3ee4B4FD64631E5bA54EAa3cB";
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const shared = await contract.getAllSharedPasswordsSent();

        const sharedPasswordData = shared.map(
          ([name, encryptedDataHash, sharedBy, sharedWith]: [string, string, string, string]) => ({
            name,
            encryptedDataHash,
            sharedBy,
            sharedWith,
          }),
        );

        setSharedPasswords(sharedPasswordData);
      } catch (error) {
        console.error("Failed to fetch shared logins:", error);
      }
    }
  };

  useEffect(() => {
    fetchSharedPasswords();
  }, []);

  const handleViewPassword = (id: string, index: number) => {
    router.push(`/sharedwithothers/password/${id}/${index}`);
  };

  const handleRevokePassword = async (sharedWith: string, name: string, encryptedDataHash: string) => {
    if (!window.ethereum) return;

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = "0x90b8Bbe202Bc7ae3ee4B4FD64631E5bA54EAa3cB";
      const contractABI = ShareablePasswordManager.abi;

      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.revokeSharedPassword(sharedWith, name, encryptedDataHash); // Replace with actual parameters later
      await tx.wait();

      fetchSharedPasswords();
    } catch (error) {
      console.error("Failed to revoke login:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter passwords based on search text
  const filteredPasswords = sharedPasswords.filter(password =>
    password.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Logins Shared With Others</h1>

      {/* Search bar for filtering */}
      <div className="max-w-2xl mx-auto mb-4">
        <input
          type="text"
          placeholder="Search logins..."
          className="input input-bordered w-full"
          value={searchText}
          onChange={e => setSearchText(e.target.value)} // Update search text on change
        />
      </div>

      <div className="max-w-2xl mx-auto">
        {filteredPasswords.length === 0 ? (
          <p className="text-center">No logins shared with others yet.</p>
        ) : (
          <div className="overflow-y-auto h-[420px]">
            {" "}
            {/* Scrollable container */}
            {filteredPasswords.map((password, index) => (
              <div key={password.encryptedDataHash} className="bg-base-100 shadow-md rounded-lg p-4 mb-4">
                <h2 className="font-bold">{password.name}</h2>
                <p>Shared with: {password.sharedWith}</p>
                <div className="flex justify-between mt-4">
                  <button
                    className="btn btn-success"
                    onClick={() => handleViewPassword(password.encryptedDataHash, index)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-error"
                    onClick={() => handleRevokePassword(password.sharedWith, password.name, password.encryptedDataHash)}
                    disabled={loading}
                  >
                    {loading ? "Revoking..." : "Revoke"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedWithOthersPage;
