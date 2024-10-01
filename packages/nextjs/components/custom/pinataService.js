import axios from "axios";

//const JWT = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const JWT =
  process.env.NEXT_PUBLIC_PINATA_JWT_PART_1 +
  process.env.NEXT_PUBLIC_PINATA_JWT_PART_2 +
  process.env.NEXT_PUBLIC_PINATA_JWT_PART_3; // Ensure this is set correctly

/**
 * Uploads a string to IPFS via Pinata.
 * @param {string} encryptedData - The stringified data to upload to IPFS.
 * @returns {Promise<string>} - The IPFS hash of the uploaded content.
 */
const pinJSONToIPFS = async encryptedData => {
  // Ensure the input is a string (if not, handle the error appropriately)
  if (typeof encryptedData !== "string") {
    throw new Error("Input data must be a string");
  }

  const pinataOptions = {
    pinataMetadata: {
      name: "EncryptedDataUpload", // Optional metadata for your upload
    },
    pinataOptions: {
      cidVersion: 0,
    },
  };

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        pinataContent: encryptedData, // Directly use the encrypted string
        ...pinataOptions,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT}`,
        },
      },
    );

    console.log("IPFS Hash:", res.data.IpfsHash); // Log the IPFS hash
    return res.data.IpfsHash; // Return the IPFS hash
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error; // Re-throw the error to handle it outside
  }
};

/**
 * Fetches data from IPFS using Pinata's gateway given an IPFS hash.
 * @param {string} ipfsHash - The IPFS hash of the data to fetch.
 * @returns {Promise<string>} - The data retrieved from IPFS as a string.
 */
const fetchDataFromIPFS = async ipfsHash => {
  if (typeof ipfsHash !== "string") {
    throw new Error("IPFS hash must be a string");
  }

  const gatewayURL = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

  try {
    const res = await axios.get(gatewayURL);
    console.log("Data fetched from IPFS:", res.data);
    return res.data; // This will return the data stored in IPFS
  } catch (error) {
    console.error("Error fetching data from IPFS:", error);
    throw error;
  }
};

export { pinJSONToIPFS, fetchDataFromIPFS };
