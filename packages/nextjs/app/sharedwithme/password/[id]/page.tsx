"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const PasswordDetailPage = () => {
  const params = useParams(); // Access the route parameters
  const { id } = params; // Get 'id' from params
  const [encryptedDataHash, setEncryptedDataHash] = useState("");
  console.log(id);

  // Fetch password details by ID (dummy data for now)
  useEffect(() => {
    setEncryptedDataHash(id.toString());
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Password Details</h1>
      <div className="max-w-md mx-auto bg-base-100 shadow-lg rounded-lg p-6">
        <div className="mb-4">
          <label className="block font-medium mb-2">Encrypted Data Hash</label>
          <input value={encryptedDataHash} disabled className="w-full" />
        </div>
        <h4>Only the recipient can decrypt this data.</h4>
        <br />
        <div className="mb-4 flex space-x-4 justify-between">
          <button>View on IPFS</button>
          <button>Decrypt</button>
        </div>
      </div>
    </div>
  );
};

export default PasswordDetailPage;
