import React, { useEffect, useState } from "react";
import ShareablePasswordManager from "../../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import "./PasswordManagement.css";
import PasswordTable from "./PasswordTable";
import { ethers } from "ethers";

//import PasswordTable, { PasswordData } from "./PasswordTable";

const PasswordManagement: React.FC = () => {
  // Define the PasswordData type or interface
  interface PasswordData {
    name: string;
    encryptedDataHash: string;
  }

  const [passwords, setPasswords] = useState<PasswordData[]>([]);
  //const [sharedPasswordsSent, setSharedPasswordsSent] = useState<PasswordData[]>([]);
  //const [sharedPasswordsReceived, setSharedPasswordsReceived] = useState<PasswordData[]>([]);

  // Assume that we have some data fetching logic here
  // This is just dummy data for illustration purposes
  /**
  const dummyPasswords = [
    { name: "My Website", encryptedDataHash: "abc123" },
    { name: "My Email", encryptedDataHash: "def456" },
  ];
   */

  const dummySharedPasswordsSent = [{ name: "Friend's Website", encryptedDataHash: "ghi789" }];

  const dummySharedPasswordsReceived = [{ name: "Colleague's App", encryptedDataHash: "jkl012" }];

  // Function for the user to getPasswords (personal passwords)
  async function getPasswords() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace with your contract address
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const tx = await contract.getPasswords();

        console.log("User got passwords successfully!");

        // Loop through the returned array and log each password with its name and encryptedDataHash
        const passwordData = tx.map(([name, encryptedDataHash]: [string, string]) => ({
          name,
          encryptedDataHash,
        }));

        // Log the structured data
        console.log(passwordData);
        setPasswords(passwordData);

        // Optional: loop through and log each item individually
        passwordData.forEach((password: { name: string; encryptedDataHash: string }, index: number) => {
          console.log(`Password ${index + 1}:`);
          console.log(`Name: ${password.name}`);
          console.log(`Encrypted Data Hash: ${password.encryptedDataHash}`);
        });
      } catch (error) {
        console.error("Failed to get passwords:", error);
      }
    } else {
      console.log("Please install Metamask!");
    }
  }

  useEffect(() => {
    getPasswords();
  }, []);

  return (
    <div className="password-management-container">
      <h2>Password Management</h2>

      <div className="password-table-container">
        <button className="btn" onClick={getPasswords}>
          Get Passwords
        </button>
        <br></br>
        <br></br>
        <br></br>
        <div className="divider"></div>
        <h3>My Passwords</h3>
        <PasswordTable
          passwords={passwords}
          onUpdate={(name, encryptedDataHash) => {
            console.log("Update password:", name, encryptedDataHash);
          }}
          onDelete={(name, encryptedDataHash) => {
            console.log("Delete password:", name, encryptedDataHash);
          }}
        />
      </div>
      <br></br>
      <br></br>
      <br></br>
      <div className="password-table-container">
        <div className="divider"></div>
        <h3>Shared with Others</h3>
        <PasswordTable
          passwords={dummySharedPasswordsSent}
          onRevoke={(name, encryptedDataHash) => {
            console.log("Revoke shared password:", name, encryptedDataHash);
          }}
        />
      </div>
      <br></br>
      <br></br>
      <br></br>
      <div className="password-table-container">
        <div className="divider"></div>
        <h3>Shared with Me</h3>
        <PasswordTable passwords={dummySharedPasswordsReceived} />
      </div>
    </div>
  );
};

export default PasswordManagement;
