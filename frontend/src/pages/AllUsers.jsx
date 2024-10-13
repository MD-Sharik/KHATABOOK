// src/pages/AllUsers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import useBack from "../hooks/useBack.jsx";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const back = useBack();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/allusers");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <button
        onClick={back}
        className="mb-5 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
      >
        Back
      </button>
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
        All Users
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg shadow-md p-4 transition-transform transform hover:scale-105"
          >
            <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">{user.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllUsers;
