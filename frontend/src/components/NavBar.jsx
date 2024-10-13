import React from "react";
import { useNavigate } from "react-router-dom";
import useBack from "../hooks/useBack";
import useLogout from "../hooks/useLogout";
import { ChevronLeft, Home, LogOut } from "lucide-react";

function NavBar() {
  const back = useBack();
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={back}
              className="text-white hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out flex items-center"
            >
              <ChevronLeft className="mr-2" size={20} />
              Back
            </button>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out flex items-center mx-2"
            >
              <Home className="mr-2" size={20} />
              Home
            </button>
            <button
              onClick={logout}
              className="text-white hover:bg-red-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out flex items-center ml-2"
            >
              <LogOut className="mr-2" size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
