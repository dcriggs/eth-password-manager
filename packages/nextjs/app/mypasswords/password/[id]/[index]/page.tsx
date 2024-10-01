"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ShareablePasswordManager from "../../../../../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import { fetchDataFromIPFS, pinJSONToIPFS } from "../../../../../components/custom/pinataService";
import * as sigUtil from "@metamask/eth-sig-util";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

const PasswordDetailPage = () => {
  const params = useParams(); // Access the route parameters
  const router = useRouter(); // Initialize router
  const { id, index } = params; // Get 'id' from params
  const [encryptedDataHash, setEncryptedDataHash] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  //const [loading, setLoading] = useState(false);
  //const [message, setMessage] = useState("");
  const { address: connectedAddress } = useAccount();

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

  function encryptPassword(publicKey: string, password: string | null) {
    const encryptedData = sigUtil.encrypt({
      publicKey: publicKey,
      data: password,
      version: "x25519-xsalsa20-poly1305",
    });
    return encryptedData;
  }

  const uploadDataToIPFS = async (encryptedData: string) => {
    try {
      // Use await to wait for the promise to resolve and get the IPFS hash
      const hash = await pinJSONToIPFS(encryptedData);

      // Now you can use the IPFS hash returned by the function
      console.log("Uploaded to IPFS with hash:", hash);

      return hash;
    } catch (error) {
      // If an error occurs, it will be caught here
      console.error("Failed to upload to IPFS:", error);
    }
  };

  // Function to decrypt the password
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
        setIsDecrypted(true); // Mark as decrypted
      } else {
        console.error("Parsed data is invalid:", parsedData);
      }
    } catch (error) {
      console.error("Error during data retrieval or decryption:", error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handlePasswordAction = async (event: React.FormEvent, isEditing: boolean, index?: number) => {
    event.preventDefault();

    // Create the JSON object for encryption
    const encodedData = JSON.stringify({
      username: username,
      password: password,
      website: website,
    });

    // Proceed to interact with the smart contract to store or update the password
    if (window.ethereum) {
      try {
        //setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Get the user's public key from the smart contract
        const userPublicKey = await contract.getUserPublicKey(connectedAddress);

        // Encrypt the encodedData using the public key
        const encryptedData = encryptPassword(userPublicKey, encodedData);

        // Upload the encrypted data to IPFS with Pinata; get the hash in return
        const returnedHash = await uploadDataToIPFS(JSON.stringify(encryptedData));

        if (isEditing && index !== undefined) {
          // Call the smart contract function to update the password
          const tx = await contract.updatePasswordDetails(index, name, returnedHash);
          await tx.wait();
          //setMessage("Password updated successfully!");
        } else {
          // Call the smart contract function to store the password
          const tx = await contract.storePassword(name, returnedHash);
          await tx.wait();
          //setMessage("Password added successfully!");
        }

        // Reset form fields after submission
        setUsername("");
        setPassword("");
        setWebsite("");
      } catch (error) {
        console.error("Failed to store or update login:", error);
        //setMessage("Failed to store or update password.");
      } finally {
        //setLoading(false);
        // Navigate to the main page for my passwords since data changed
        router.push(`/mypasswords`);
      }
    } else {
      //setMessage("Please install MetaMask!");
    }
  };

  const fetchMyPasswords = useCallback(async () => {
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
    fetchMyPasswords();
  }, [id, fetchMyPasswords]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Login Details</h1>
      <h4 className="text-center mb-8">Only you can decrypt your own saved logins.</h4>
      <div className="max-w-md mx-auto bg-base-100 shadow-lg rounded-lg p-6">
        <form onSubmit={event => handlePasswordAction(event, isEditing, Number(index))}>
          <div className="mb-4">
            <label className="block font-medium mb-2">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} disabled={!isEditing} className="w-full" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={!isEditing}
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Password</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={!isEditing}
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Website URL</label>
            <input
              value={website}
              onChange={e => setWebsite(e.target.value)}
              disabled={!isEditing}
              className="w-full"
            />
          </div>
          <br />
          <div className="mb-4 flex justify-between space-x-4">
            <a href={`https://gateway.pinata.cloud/ipfs/` + encryptedDataHash}>
              <button type="button" className="btn">
                View on IPFS
              </button>
            </a>
            {isDecrypted && !isEditing && (
              <button type="button" className="btn btn-secondary" onClick={handleEditToggle}>
                Edit
              </button>
            )}
            {isEditing && (
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            )}
            <button type="button" className="btn btn-active btn-primary" onClick={handleDecryptPassword}>
              Decrypt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordDetailPage;
