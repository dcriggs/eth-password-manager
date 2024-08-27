"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const PasswordDetailPage = () => {
  const params = useParams(); // Access the route parameters
  const { id } = params; // Get 'id' from params
  const [encryptedDataHash, setEncryptedDataHash] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  console.log(id);

  // Fetch password details by ID (dummy data for now)
  useEffect(() => {
    setEncryptedDataHash(id.toString());
  }, [id]);

  const handleDecryptPassword = () => {
    setUsername("TestUser");
    setPassword("TestPassword");
    setWebsite("TestSite.com");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Password Details</h1>
      <div className="max-w-md mx-auto bg-base-100 shadow-lg rounded-lg p-6">
        <div className="mb-4">
          <label className="block font-medium mb-2">Encrypted Data Hash</label>
          <input value={encryptedDataHash} disabled className="w-full" />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Username</label>
          <input value={username} disabled className="w-full" />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Password</label>
          <input value={password} disabled className="w-full" />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Website</label>
          <input value={website} disabled className="w-full" />
        </div>
        <h4>Only you can decrypt your own saved passwords.</h4>
        <br />
        <div className="mb-4 flex justify-between space-x-4">
          <button>View on IPFS</button>
          <button onClick={handleDecryptPassword}>Decrypt</button>
        </div>
      </div>
    </div>
  );
};

export default PasswordDetailPage;
