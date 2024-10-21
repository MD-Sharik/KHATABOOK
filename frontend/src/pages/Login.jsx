// src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPhone] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3000/login", {
        email,
        password,
      });
      const { userId, token } = response.data;

      // Store user ID and token in local storage
      localStorage.setItem("userId", userId);
      localStorage.setItem("token", token);

      navigate("/dashboard"); // Redirect to the dashboard after login
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-5">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border border-gray-400 rounded mb-4"
      />
      <input
        type="text"
        placeholder="Phone"
        value={password}
        onChange={(e) => setPhone(e.target.value)}
        className="p-2 border border-gray-400 rounded mb-4"
      />
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200"
      >
        Login
      </button>
    </div>
  );
};

export default Login;
