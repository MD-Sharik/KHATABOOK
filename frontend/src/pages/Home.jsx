import React from "react";
import { Link } from "react-router-dom";
import { UserPlus, LogIn, Users } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-5">
      <div className="bg-white rounded-lg  p-8 max-w-lg w-full">
        <h1 className="text-4xl font-bold text-blue-600 mb-2 text-center">
          Welcome to ApnaKhata
        </h1>
        <p className="text-lg text-blue-900 mb-8 text-center">
          Manage your transactions easily and efficiently.
        </p>
        <div className="space-y-4">
          <Link
            to="/login"
            className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          >
            <LogIn className="mr-2" size={20} />
            Login
          </Link>
          <Link
            to="/signup"
            className="flex items-center justify-center w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          >
            <UserPlus className="mr-2" size={20} />
            Sign Up
          </Link>

          <Link
            to="/allusers"
            className="flex items-center justify-center w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          >
            <Users className="mr-2" size={20} />
            View All Users
          </Link>
        </div>
      </div>
      <footer className="mt-8 text-white text-center">
        <p>&copy; 2023 ApnaKhata. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
