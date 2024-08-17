import React, { useState } from "react";
import * as sigUtil from "@metamask/eth-sig-util";

const EncryptPasswordComponent: React.FC = () => {
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

  // Function to encrypt the password
  function encryptPassword(publicKey: string, password: string) {
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

  // Example usage: Encrypt and then decrypt a password
  async function handleEncryptAndDecrypt() {
    const publicKey = await getPublicKey();
    if (publicKey) {
      const password = JSON.stringify({
        username: "test",
        password: "testing",
        website: "test.com",
      });
      //const password = "my_secure_password";
      //const password = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
      const encryptedData = encryptPassword(publicKey, password);
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

  return (
    <div className="items-center">
      <h2>Encrypt and Decrypt Password</h2>
      <br />
      <br />
      <button onClick={handleEncryptAndDecrypt}>Click to Start the Test</button>
      <br />
      {encryptedData && (
        <div>
          <h3>Encrypted Data:</h3>
          <input defaultValue={encryptedData}></input>
        </div>
      )}

      {decryptedPassword && (
        <div>
          <h3>Decrypted Password:</h3>
          <input defaultValue={decryptedPassword}></input>
        </div>
      )}
    </div>
  );
};

export default EncryptPasswordComponent;
