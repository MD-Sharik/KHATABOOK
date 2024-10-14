import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [phone_number, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateInputs = () => {
    if (!email || !phone_number) {
      setError("Both email and phone number are required.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true); // Start loading
    setError(""); // Reset error message

    try {
      const response = await axios.post("http://localhost:3000/login", {
        email,
        phone_number,
      });
      const { userId, token, name } = response.data;

      // Store user details in local storage
      localStorage.setItem("userId", userId);
      localStorage.setItem("token", token);
      localStorage.setItem("userName", name);

      navigate("/dashboard"); // Redirect to the dashboard after login
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-5">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-4xl font-bold text-blue-700 mb-6 text-center">
          Login
        </h1>

        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}

        <label className="block mb-2 text-gray-700">Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <label className="block mb-2 text-gray-700">Phone Number</label>
        <input
          type="text"
          placeholder="Phone Number"
          value={phone_number}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-6"
        />

        <button
          onClick={handleLogin}
          className={`w-full px-4 py-2 bg-green-600 text-white rounded ${
            loading ? "cursor-not-allowed opacity-50" : "hover:bg-green-700"
          } transition duration-200`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-gray-500 mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
