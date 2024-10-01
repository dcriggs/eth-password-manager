"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShareablePasswordManager from "../../artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import { ethers } from "ethers";

const MyPasswordsPage = () => {
  const [myPasswords, setMyPasswords] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchMyPasswords = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x90b8Bbe202Bc7ae3ee4B4FD64631E5bA54EAa3cB";
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const passwords = await contract.getPasswords();

        const passwordData = passwords.map(([name, encryptedDataHash]: [string, string]) => ({
          name,
          encryptedDataHash,
        }));

        setMyPasswords(passwordData);
      } catch (error) {
        console.error("Failed to fetch your logins:", error);
      }
    } else {
      console.error("Please install Metamask!");
    }
  };

  useEffect(() => {
    fetchMyPasswords();
  }, []);

  const handleViewPassword = (id: string, index: number) => {
    router.push(`/mypasswords/password/${id}/${index}`);
  };

  const handleDeletePassword = async (id: string) => {
    if (!window.ethereum) return;

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = "0x90b8Bbe202Bc7ae3ee4B4FD64631E5bA54EAa3cB";
      const contractABI = ShareablePasswordManager.abi;

      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.deletePassword(id);
      await tx.wait();

      fetchMyPasswords();
    } catch (error) {
      console.error("Failed to delete login:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter passwords based on search text
  const filteredPasswords = myPasswords.filter(password =>
    password.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">My Logins</h1>

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
          <p className="text-center">No logins found.</p>
        ) : (
          <div className="overflow-y-auto h-[420px]">
            {" "}
            {/* Scrollable container */}
            {filteredPasswords.map((password, index) => (
              <div key={password.encryptedDataHash} className="bg-base-100 shadow-md rounded-lg p-4 mb-4">
                <h2 className="font-bold">{password.name}</h2>
                <div className="flex justify-between mt-4">
                  <button
                    className="btn btn-success"
                    onClick={() => handleViewPassword(password.encryptedDataHash, index)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-error"
                    onClick={() => handleDeletePassword(index.toString())}
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete"}
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

export default MyPasswordsPage;
