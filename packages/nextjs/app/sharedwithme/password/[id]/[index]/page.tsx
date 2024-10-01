"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ShareablePasswordManager from "../../../../../artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import { fetchDataFromIPFS } from "../../../../../components/custom/pinataService";
import { ethers } from "ethers";

const PasswordDetailPage = () => {
  const params = useParams(); // Access the route parameters
  const { id, index } = params;
  const [encryptedDataHash, setEncryptedDataHash] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [name, setName] = useState("");

  const downloadDataFromIPFS = async (encryptedDataHash: string) => {
    try {
      // Use await to wait for the promise to resolve and get the IPFS hash
      const data = await fetchDataFromIPFS(encryptedDataHash);

      // Now you can use the IPFS hash returned by the function
      console.log("Downloaded from IPFS with hash: ", data);

      return data;
    } catch (error) {
      // If an error occurs, it will be caught here
      console.error("Failed to download from IPFS: ", error);
    }
  };

  // Function to decrypt the login
  async function decryptPassword(encryptedData: any) {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const decryptedMessage = await window.ethereum.request({
          method: "eth_decrypt",
          params: [JSON.stringify(encryptedData), accounts[0]],
        });
        return decryptedMessage;
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("Please install Metamask!");
    }
  }

  const handleDecryptPassword = async () => {
    try {
      // Download the encrypted data from IPFS
      const encryptedData = await downloadDataFromIPFS(encryptedDataHash);
      //console.log('Encrypted Data from IPFS:', encryptedData);

      // Check if encryptedData is not empty or undefined
      if (!encryptedData) {
        throw new Error("Failed to download data or received empty data.");
      }

      // Decrypt the downloaded data
      const decryptedPassword = await decryptPassword(JSON.parse(encryptedData));
      //console.log('Decrypted Password:', decryptedPassword);

      // Check if decryptedPassword is not empty or undefined
      if (!decryptedPassword) {
        throw new Error("Failed to decrypt data or received empty data.");
      }

      // Parse JSON data from the decrypted data
      let parsedData;
      try {
        parsedData = JSON.parse(decryptedPassword);
      } catch (jsonError) {
        console.error("Error parsing JSON from decrypted data:", jsonError);
        return; // Exit the function if JSON parsing fails
      }

      // Ensure parsedData contains the expected fields
      if (parsedData) {
        setUsername(parsedData.username || "");
        setPassword(parsedData.password || "");
        setWebsite(parsedData.website || "");
      } else {
        console.error("Parsed data is invalid:", parsedData);
      }
    } catch (error) {
      console.error("Error during data retrieval or decryption:", error);
    }
  };

  const fetchSharedPasswords = useCallback(async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x90b8Bbe202Bc7ae3ee4B4FD64631E5bA54EAa3cB";
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const passwords = await contract.getAllSharedPasswordsReceived();

        const passwordData = passwords.map(([name, encryptedDataHash]: [string, string]) => ({
          name,
          encryptedDataHash,
        }));

        setName(passwordData[Number(index)].name);
      } catch (error) {
        console.error("Failed to fetch your logins:", error);
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
          <label className="block font-medium mb-2">Username</label>
          <input value={username} disabled className="w-full" />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Password</label>
          <input value={password} disabled className="w-full" />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Website URL</label>
          <input value={website} disabled className="w-full" />
        </div>
        <br />
        <div className="mb-4 flex space-x-4 justify-between">
          <a href={`https://gateway.pinata.cloud/ipfs/` + encryptedDataHash}>
            <button className="btn">View on IPFS</button>
          </a>
          <button className="btn btn-active btn-primary" onClick={handleDecryptPassword}>
            Decrypt
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordDetailPage;
