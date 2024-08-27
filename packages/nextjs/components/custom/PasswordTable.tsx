import React from "react";

interface PasswordTableProps {
  passwords: { name: string; encryptedDataHash: string }[];
  onView: (password: { name: string; encryptedDataHash: string }) => void;
  onUpdate: (password: { name: string; encryptedDataHash: string }) => void;
  onDelete: (password: { name: string; encryptedDataHash: string }) => void;
  onDecrypt: (password: { name: string; encryptedDataHash: string }) => void;
}

const PasswordTable: React.FC<PasswordTableProps> = ({ passwords, onView, onUpdate, onDelete, onDecrypt }) => {
  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {passwords.map((password, index) => (
          <tr key={index}>
            <td>{password.name}</td>
            <td>
              <button className="btn btn-sm" onClick={() => onView(password)}>
                View
              </button>
              <button className="btn btn-sm" onClick={() => onUpdate(password)}>
                Update
              </button>
              <button className="btn btn-sm" onClick={() => onDelete(password)}>
                Delete
              </button>
              <button className="btn btn-sm" onClick={() => onDecrypt(password)}>
                Decrypt
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PasswordTable;
