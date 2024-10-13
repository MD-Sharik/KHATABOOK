// src/pages/ManageUsers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageUsers = ({ bookId }) => {
  const [users, setUsers] = useState([]);
  const [dummyUser, setDummyUser] = useState("");

  useEffect(() => {
    // Fetch existing users for the book when the component mounts
    fetchUsers();
  }, [bookId]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`/api/books/${bookId}/users`); // Adjust the endpoint
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAddDummyUser = async () => {
    try {
      const response = await axios.post(`/api/books/${bookId}/users`, {
        name: dummyUser,
      });
      setUsers((prev) => [...prev, response.data]); // Add the new user to the state
      setDummyUser(""); // Reset the input
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  return (
    <div>
      <h2>Manage Users in Book</h2>
      <input
        type="text"
        placeholder="Add Dummy User"
        value={dummyUser}
        onChange={(e) => setDummyUser(e.target.value)}
      />
      <button onClick={handleAddDummyUser}>Add User</button>

      <h3>Existing Users:</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ManageUsers;
