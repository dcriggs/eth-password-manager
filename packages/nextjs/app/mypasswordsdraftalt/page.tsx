"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShareablePasswordManager from "../../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
import PasswordTable from "../../components/custom/PasswordTable";
import "./mypasswords.css";
import { ethers } from "ethers";

// Define the PasswordData type or interface
interface PasswordData {
  name: string;
  encryptedDataHash: string;
}

const MyPasswordsPage: React.FC = () => {
  const [passwords, setPasswords] = useState<PasswordData[]>([]);
  //const [selectedPassword, setSelectedPassword] = useState<PasswordData | null>(null);
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  //const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [newPassword, setNewPassword] = useState({ name: "", encryptedDataHash: "" });
  const router = useRouter();

  // Function to fetch passwords from the smart contract
  async function getPasswords() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const tx = await contract.getPasswords();

        console.log("User got passwords successfully!");

        const passwordData = tx.map(([name, encryptedDataHash]: [string, string]) => ({
          name,
          encryptedDataHash,
        }));

        console.log(passwordData);
        setPasswords(passwordData);
      } catch (error) {
        console.error("Failed to get passwords:", error);
      }
    } else {
      console.log("Please install Metamask!");
    }
  }

  // Function to add a new password
  async function addPassword() {
    if (newPassword.name && newPassword.encryptedDataHash) {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
          const contractABI = ShareablePasswordManager.abi;

          const contract = new ethers.Contract(contractAddress, contractABI, signer);

          // Store password data on IPFS, get hash and store on blockchain
          const response = await contract.addPassword(newPassword.name, newPassword.encryptedDataHash);

          console.log("Password added successfully:", response);

          // Refresh the password list
          await getPasswords();

          // Clear form fields
          setNewPassword({ name: "", encryptedDataHash: "" });
        }
      } catch (error) {
        console.error("Failed to add password:", error);
      }
    } else {
      console.log("Please enter both the name and encrypted data.");
    }
  }

  useEffect(() => {
    getPasswords();
  }, []);

  return (
    <div className="password-management-container container mx-auto px-4 py-8">
      <div className="password-table-container">
        {/* Add new password form */}
        <div className="add-password-form">
          <h3>Add New Password</h3>
          <input
            type="text"
            placeholder="Password Name"
            className="input input-bordered w-full max-w-xs"
            value={newPassword.name}
            onChange={e => setNewPassword({ ...newPassword, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Encrypted Data Hash"
            className="input input-bordered w-full max-w-xs"
            value={newPassword.encryptedDataHash}
            onChange={e => setNewPassword({ ...newPassword, encryptedDataHash: e.target.value })}
          />
          <button className="btn btn-primary mt-2" onClick={addPassword}>
            Add Password
          </button>
        </div>
        <br />
        <div className="divider"></div>

        {/* Conditional rendering for when there are no passwords */}
        {passwords.length === 0 ? (
          <p>This is where your passwords will appear once you add them!</p>
        ) : (
          <PasswordTable
            passwords={passwords}
            onView={password => {
              router.push(`/mypasswords/password/${password.encryptedDataHash}`);
            }}
            onDelete={password => {
              console.log("Delete password:", password.name, password.encryptedDataHash);
            }}
            onUpdate={password => {
              console.log("Update password:", password.name, password.encryptedDataHash);
            }}
            onDecrypt={password => {
              console.log("Decrypt password:", password.name, password.encryptedDataHash);
            }}
          />
        )}
      </div>

      {/* Decrypt Modal */}

      <dialog id="decrypt_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Decrypted Password</h3>
          <p className="py-4">{decryptedData}</p>
          <div className="modal-action">
            {/* Use form method="dialog" to allow the modal to close when button is clicked */}
            <form method="dialog">
              <button
                className="btn"
                onClick={() => {
                  //setShowDecryptModal(false);
                  //setSelectedPassword(null);
                  setDecryptedData(null);
                }}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default MyPasswordsPage;
