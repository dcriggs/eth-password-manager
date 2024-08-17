import React from "react";
//import React, { useState } from "react";
import "./PasswordManagement.css";
import PasswordTable from "./PasswordTable";

//import PasswordTable, { PasswordData } from "./PasswordTable";

const PasswordManagement: React.FC = () => {
  //const [passwords, setPasswords] = useState<PasswordData[]>([]);
  //const [sharedPasswordsSent, setSharedPasswordsSent] = useState<PasswordData[]>([]);
  //const [sharedPasswordsReceived, setSharedPasswordsReceived] = useState<PasswordData[]>([]);

  // Assume that we have some data fetching logic here
  // This is just dummy data for illustration purposes
  const dummyPasswords = [
    { name: "My Website", encryptedDataHash: "abc123" },
    { name: "My Email", encryptedDataHash: "def456" },
  ];

  const dummySharedPasswordsSent = [{ name: "Friend's Website", encryptedDataHash: "ghi789" }];

  const dummySharedPasswordsReceived = [{ name: "Colleague's App", encryptedDataHash: "jkl012" }];

  return (
    <div className="password-management-container">
      <h2>Password Management</h2>

      <div className="password-table-container">
        <h3>Your Passwords</h3>
        <PasswordTable
          passwords={dummyPasswords}
          onUpdate={(name, encryptedDataHash) => {
            console.log("Update password:", name, encryptedDataHash);
          }}
          onDelete={(name, encryptedDataHash) => {
            console.log("Delete password:", name, encryptedDataHash);
          }}
        />
      </div>

      <div className="password-table-container">
        <h3>Shared Passwords Sent</h3>
        <PasswordTable
          passwords={dummySharedPasswordsSent}
          onRevoke={(name, encryptedDataHash) => {
            console.log("Revoke shared password:", name, encryptedDataHash);
          }}
        />
      </div>

      <div className="password-table-container">
        <h3>Shared Passwords Received</h3>
        <PasswordTable passwords={dummySharedPasswordsReceived} />
      </div>
    </div>
  );
};

export default PasswordManagement;
