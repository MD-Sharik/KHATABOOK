// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-5">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">
        Welcome to ApnaKhata
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Manage your transactions easily.
      </p>
      <div className="flex flex-col space-y-4">
        <Link
          to="/signup"
          className="px-4 py-2 bg-green-600 text-center text-white rounded hover:bg-green-700 transition duration-200"
        >
          Sign Up
        </Link>
        <Link
          to="/login"
          className="px-4 py-2 text-center bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
        >
          Login
        </Link>
        <Link
          to="/allusers"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
        >
          View All Users
        </Link>
      </div>
    </div>
  );
};

export default Home;
