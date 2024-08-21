"use client";

//import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const handleRegister = async () => {
    // Registration logic goes here
    // This should trigger the wallet to ask for signing transactions
    console.log("Register button clicked");
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
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
        <div className="mt-8 text-center">
          <p className="text-lg mb-4">Register to use the Password Manager (0.01 ETH registration fee)</p>
          <button className="btn btn-primary" onClick={handleRegister}>
            Register
          </button>
        </div>

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
    </>
  );
};

export default Home;
