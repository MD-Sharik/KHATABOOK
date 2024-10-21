import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { PlusCircle, Users, FileText, Book } from "lucide-react";

const BookDetail = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [tally, setTally] = useState([]);
  const [grandTally, setGrandTally] = useState(0);
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState(""); // For dummy users
  const [inviteEmail, setInviteEmail] = useState(""); // For real users

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/books/${bookId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(response.data);
        setBook(response.data.book);
        setTally(response.data.transactions);
        setUsers(response.data.users);

        // Calculate grand tally
        const totalTally = response.data.transactions.reduce(
          (acc, transaction) => {
            const amount = parseFloat(transaction.amount);
            return transaction.type === "give" ? acc - amount : acc + amount;
          },
          0
        );
        setGrandTally(totalTally);
      } catch (error) {
        console.error("Error fetching book details:", error);
      }
    };
    fetchBookDetails();
  }, [bookId]);

  // Function to add a dummy user
  const addDummyUser = async () => {
    if (newUserName !== "") {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }

        const response = await axios.post(
          `http://localhost:3000/books/${bookId}/dummy_users`,
          { name: newUserName },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers([...users, response.data]);
        setNewUserName("");
        alert("Dummy user added successfully!");
      } catch (error) {
        console.error("Error adding dummy user to the book:", error);
        if (error.response) {
          switch (error.response.status) {
            case 403:
              alert(
                "You don't have permission to add dummy users to this book."
              );
              break;
            case 404:
              alert("Book not found.");
              break;
            case 401:
              alert("Authentication failed. Please log in again.");
              break;
            default:
              alert(`Failed to add dummy user: ${error.response.data.error}`);
          }
        } else {
          alert("Failed to add dummy user. Please try again.");
        }
      }
    } else {
      alert("Please provide a dummy user name.");
    }
  };

  // Function to invite an existing user via email
  const inviteUser = async () => {
    if (inviteEmail !== "") {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `http://localhost:3000/books/${bookId}/invite`,
          { email: inviteEmail },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Invitation sent!");
        setInviteEmail("");
      } catch (error) {
        console.error("Error sending invitation:", error);
        alert("Failed to send invitation. Please try again.");
      }
    } else {
      alert("Please provide an email for the invitation.");
    }
  };

  const navigateToUserDetail = (userId) => {
    navigate(`/books/${bookId}/users/${userId}`, { state: { bookId } });
  };

  if (!book) {
    return (
      <div className="text-center text-gray-600 text-xl mt-10">
        Loading book details...
      </div>
    );
  }

  return (
    <div className="min-h-[92.4vh] bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Book Details and Tally */}
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">{book.name}</h1>
          <div className="text-2xl font-bold mb-2">
            Total:{" "}
            <span
              className={`${
                grandTally >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {grandTally.toFixed(2)}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-6">{book.description}</p>

        {/* Adding Users Section */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Users</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          {/* Users List */}
          {users.length > 0 ? (
            <table className="w-full px-4">
              <thead>
                <tr className="px-4">
                  <th className="text-left px-4   ">Name</th>
                  <th className="text-left px-4    ">Email</th>
                  <th className="text-left  px-4  ">Tally</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td
                      className="px-4"
                      onClick={() => navigateToUserDetail(user.id)}
                    >
                      {user.username}
                      {user.email.startsWith("dummy-") && (
                        <span className="text-xs px-4 text-gray-500 ml-2">
                          (Dummy User)
                        </span>
                      )}
                    </td>
                    <td className="px-4">{user.email}</td>
                    <td className="px-4">{user.tally}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-4 text-gray-500">No users found</p>
          )}
        </div>

        {/* Add Dummy User Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Add Dummy User
          </h3>
          <div className="flex items-center">
            <div className="flex-grow mr-4">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter dummy user name"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={addDummyUser}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center"
            >
              <PlusCircle className="mr-2" size={20} />
              Add Dummy User
            </button>
          </div>
        </div>

        {/* Invite Real User Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Invite Existing User
          </h3>
          <div className="flex items-center">
            <div className="flex-grow mr-4">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter user email"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={inviteUser}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            >
              <PlusCircle className="mr-2" size={20} />
              Invite User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
