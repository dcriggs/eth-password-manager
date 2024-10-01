import React, { useState } from "react";
import ShareablePasswordManager from "../../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import * as sigUtil from "@metamask/eth-sig-util";
import { ethers } from "ethers";

const EncryptPasswordComponent: React.FC = () => {
  const [dataToEncrypt, setDataToEncrypt] = useState<string | null>(
    JSON.stringify({
      username: "test",
      password: "testing",
      website: "test.com",
    }),
  );
  const [encryptedData, setEncryptedData] = useState<string | null>(null);
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(null);

  // Function to get the public key
  async function getPublicKey() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const publicKey = await window.ethereum.request({
          method: "eth_getEncryptionPublicKey",
          params: [accounts[0]],
        });
        return publicKey;
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("Please install Metamask!");
    }
  }

  // Function to register the user with the public key
  async function registerUser(publicKey: string) {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x90b8Bbe202Bc7ae3ee4B4FD64631E5bA54EAa3cB";
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const tx = await contract.registerUser(publicKey, {
          value: ethers.parseEther("0.01"),
        });

        await tx.wait();
        console.log("User registered successfully!");
      } catch (error) {
        console.error("Failed to register user:", error);
      }
    } else {
      console.log("Please install Metamask!");
    }
  }

  // Function to encrypt the password
  function encryptPassword(publicKey: string, password: string | null) {
    const encryptedData = sigUtil.encrypt({
      publicKey: publicKey,
      data: password,
      version: "x25519-xsalsa20-poly1305",
    });
    return encryptedData;
  }

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

  // Example usage: Encrypt, register user, and then decrypt a password
  async function handleEncryptAndDecrypt() {
    const publicKey = await getPublicKey();
    if (publicKey) {
      // Register the user with the public key
      await registerUser(publicKey);

      // Encrypt the password
      const encryptedData = encryptPassword(publicKey, dataToEncrypt);
      setEncryptedData(JSON.stringify(encryptedData));
      console.log(encryptedData);

      // Simulate storing on blockchain (replace this with actual blockchain call)
      // storeOnBlockchain(encryptedData);

      // Later on, to decrypt
      const decryptedPassword = await decryptPassword(encryptedData);
      setDecryptedPassword(decryptedPassword);
      console.log(decryptedPassword);
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataToEncrypt(event.target.value);
  };

  const handleEncryptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEncryptedData(event.target.value);
  };

  const handleDecryptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDecryptedPassword(event.target.value);
  };

  return (
    <div className="items-center">
      <h2>Encrypt and Decrypt Password Test:</h2>
      <ul>
        <li>1. Input data to encrypt</li>
        <li>2. Request public key</li>
        <li>3. Register user</li>
        <li>4. Display encrypted data</li>
        <li>5. Request decryption</li>
        <li>6. Display decrypted data</li>
      </ul>
      <br />
      <br />
      {dataToEncrypt && (
        <div>
          <h3>Input test data here:</h3>
          <input type="text" value={dataToEncrypt} onChange={handleInputChange} className="input w-full max-w-xs" />
        </div>
      )}
      <br />
      <br />
      <button className="btn btn-accent" onClick={handleEncryptAndDecrypt}>
        Click Here to Start the Test
      </button>
      <br />
      <br />
      {encryptedData && (
        <div>
          <h3>Encrypted Data:</h3>
          <input type="text" value={encryptedData} onChange={handleEncryptChange} className="input w-full max-w-xs" />
          <p>
            Pretend we just stored this encrypted data on IPFS and <br></br> stored the encryptedDataHash in the
            user&apos;s passwords.
          </p>
        </div>
      )}
      <br />
      <br />
      {decryptedPassword && (
        <div>
          <h3>Decrypted Password:</h3>
          <input
            type="text"
            value={decryptedPassword}
            onChange={handleDecryptChange}
            className="input w-full max-w-xs"
          />
        </div>
      )}
    </div>
  );
};

export default EncryptPasswordComponent;
