import React from "react";

export interface PasswordData {
  name: string;
  encryptedDataHash: string;
}

interface PasswordTableProps {
  passwords: PasswordData[];
  onUpdate?: (name: string, encryptedDataHash: string) => void;
  onDelete?: (name: string, encryptedDataHash: string) => void;
  onRevoke?: (name: string, encryptedDataHash: string) => void;
}

const PasswordTable: React.FC<PasswordTableProps> = ({ passwords, onUpdate, onDelete, onRevoke }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Encrypted Data Hash</th>
            {onUpdate && <th>Update</th>}
            {onDelete && <th>Delete</th>}
            {onRevoke && <th>Revoke</th>}
          </tr>
        </thead>
        <tbody>
          {passwords.map((password, index) => (
            <tr key={index}>
              <td>{password.name}</td>
              <td>{password.encryptedDataHash}</td>
              {onUpdate && (
                <td>
                  <button onClick={() => onUpdate(password.name, password.encryptedDataHash)}>Update</button>
                </td>
              )}
              {onDelete && (
                <td>
                  <button onClick={() => onDelete(password.name, password.encryptedDataHash)}>Delete</button>
                </td>
              )}
              {onRevoke && (
                <td>
                  <button onClick={() => onRevoke(password.name, password.encryptedDataHash)}>Revoke</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PasswordTable;
