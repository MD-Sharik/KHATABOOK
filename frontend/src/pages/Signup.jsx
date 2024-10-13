import React, { useState } from "react";
import axios from "axios";
import useBack from "../hooks/useBack.jsx";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [phone_number, setPhone] = useState("");
  const [name, setName] = useState("");
  const back = useBack();

  const handleSignup = async () => {
    try {
      const response = await axios.post("http://localhost:3000/signup", {
        email,
        phone_number,
        name,
      });

      // Assuming your backend response returns an object like { user: ..., token: "..." }
      const { token } = response.data; // Extract the token from the response
      console.log("token recieved:", token); // Save the token to local storage
      localStorage.setItem("token", token);

      console.log("User signed up:", response.data);
      // You can redirect the user or show a success message here
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <button onClick={back} className="text-blue-500 hover:underline">
          Go back
        </button>
        <h1 className="text-2xl font-bold mb-4">Signup</h1>
        <input
          className="border rounded w-full p-2 mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border rounded w-full p-2 mb-4"
          placeholder="Phone"
          value={phone_number}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="border rounded w-full p-2 mb-4"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={handleSignup}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Signup;
