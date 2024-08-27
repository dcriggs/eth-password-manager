"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShareablePasswordManager from "../../hardhat/artifacts/contracts/ShareablePasswordManager.sol/ShareablePasswordManager.json";
//import * as sigUtil from "@metamask/eth-sig-util";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";

interface PasswordData {
  name: string;
  encryptedDataHash: string;
}

/*
interface SharedPasswordData {
  name: string;
  encryptedDataHash: string;
  sharedBy: string;
  sharedWith: string;
}
  */

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [passwords, setPasswords] = useState<PasswordData[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<PasswordData[]>([]);
  const [shareWithOthers, setShareWithOthers] = useState<PasswordData[]>([]);
  //const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Function to check if the user is registered
  async function getIsUserRegistered() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const tx = await contract.isUserRegistered(accounts[0]);
        setIsUserRegistered(tx);
      } catch (error) {
        console.error("Failed to look up registration status:", error);
      }
    } else {
      console.log("Please install Metamask!");
    }
  }

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
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const tx = await contract.registerUser(publicKey, {
          value: ethers.parseEther("0.01"),
        });

        await tx.wait();
        console.log("User registered successfully!");
        setIsUserRegistered(true); // Update state to reflect registration status
      } catch (error) {
        console.error("Failed to register user:", error);
      }
    } else {
      console.log("Please install Metamask!");
    }
  }

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

        const passwordData = tx.map(([name, encryptedDataHash]: [string, string]) => ({
          name,
          encryptedDataHash,
        }));

        setPasswords(passwordData);
      } catch (error) {
        console.error("Failed to get passwords:", error);
      }
    } else {
      console.log("Please install Metamask!");
    }
  }

  // Function to fetch passwords from the smart contract
  async function getAllSharedPasswordsReceived() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const tx = await contract.getAllSharedPasswordsReceived();

        const passwordData = tx.map(
          ([name, encryptedDataHash, sharedBy, sharedWith]: [string, string, string, string]) => ({
            name,
            encryptedDataHash,
            sharedBy,
            sharedWith,
          }),
        );

        setSharedWithMe(passwordData);
      } catch (error) {
        console.error("Failed to get passwords:", error);
      }
    } else {
      console.log("Please install Metamask!");
    }
  }

  // Function to fetch passwords from the smart contract
  async function getAllSharedPasswordsSent() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
        const contractABI = ShareablePasswordManager.abi;

        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const tx = await contract.getAllSharedPasswordsSent();

        const passwordData = tx.map(
          ([name, encryptedDataHash, sharedBy, sharedWith]: [string, string, string, string]) => ({
            name,
            encryptedDataHash,
            sharedBy,
            sharedWith,
          }),
        );

        setShareWithOthers(passwordData);
      } catch (error) {
        console.error("Failed to get passwords:", error);
      }
    } else {
      console.log("Please install Metamask!");
    }
  }

  const handleRegister = async () => {
    const publicKey = await getPublicKey();
    if (publicKey) {
      await registerUser(publicKey);
    }
  };

  useEffect(() => {
    getIsUserRegistered();
    getPasswords();
    getAllSharedPasswordsReceived();
    getAllSharedPasswordsSent();
  }, []);

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      {/* Welcome Section */}
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-2xl mb-2">Welcome to Dawson&apos;s</span>
          <span className="block text-4xl font-bold">ETH Password Manager</span>
        </h1>
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
          <p className="my-2 font-medium">Connected Address:</p>
          <Address address={connectedAddress} />
        </div>
      </div>
      {/* Registration Section */}
      {!isUserRegistered ? (
        <div className="mt-8 text-center">
          <p className="text-lg mb-4">Register to use the Password Manager (0.01 ETH registration fee)</p>
          <button className="btn btn-primary" onClick={handleRegister}>
            Register
          </button>
        </div>
      ) : (
        <>
          {/* User is Registered */}
          <div className="mt-8 text-center">
            <p className="text-lg mb-4">Thanks for registering!</p>
            {/* Feature Navigation */}
            <div className="flex flex-col items-center space-y-4 mt-6">
              <button className="btn btn-secondary" onClick={() => router.push("/addpassword")}>
                Add Password
              </button>
              <button className="btn btn-secondary" onClick={() => router.push("/sharepassword")}>
                Share Password
              </button>
            </div>
            {/* Displaying Stats */}
            <div className="mt-8">
              <a href="/mypasswords">
                <p>You have {passwords.length} passwords stored.</p>
              </a>
              {/* Placeholder for shared stats */}
              <a href="/sharedwithme">
                <p>Passwords shared with you: {sharedWithMe.length}</p>
              </a>
              <a href="/sharedwithothers">
                <p>Passwords you have shared: {shareWithOthers.length}</p>
              </a>
            </div>
          </div>
        </>
      )}
      {/* Embedded Video Section */}
      <div className="mt-16 w-full flex justify-center">
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with your video URL
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default Home;
