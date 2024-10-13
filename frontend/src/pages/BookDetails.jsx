import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { PlusCircle, Users, FileText, Book } from "lucide-react";

const BookDetail = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [tally, setTally] = useState([]);
  const [grandTally, setGrandTally] = useState(0); // State for grand tally
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState("");

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
        console.log(response.data.transactions);
        setBook(response.data.book);
        setTally(response.data.transactions);
        setUsers(response.data.users);

        // Calculate grand tally based on 'give' and 'get' types
        const totalTally = response.data.transactions.reduce(
          (acc, transaction) => {
            const amount = parseFloat(transaction.amount);
            if (transaction.type === "give") {
              return acc - amount; // Subtract for 'give'
            } else if (transaction.type === "get") {
              return acc + amount; // Add for 'get'
            }
            return acc;
          },
          0
        );

        setGrandTally(totalTally); // Store the calculated grand tally
      } catch (error) {
        console.error("Error fetching book details:", error);
      }
    };
    fetchBookDetails();
  }, [bookId]);

  const addUser = async () => {
    if (newUserName !== "") {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `http://localhost:3000/books/${bookId}/users`,
          { name: newUserName },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers([...users, response.data]);
        setNewUserName("");
      } catch (error) {
        console.error("Error adding user to the book:", error);
        alert("Failed to add user. Please try again.");
      }
    } else {
      alert("Add userName. Please try again");
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

        <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">
            Book Details
          </h2>
          <div className="flex items-center text-gray-600 mb-2">
            <Book className="mr-2" size={20} />
            <span>Book ID: {bookId}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="mr-2" size={20} />
            <span>Total Users: {users.length}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span>Grand Tally: {grandTally.toFixed(2)}</span>{" "}
            {/* Display Grand Tally */}
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Users</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          {users.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tally
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`${
                      user.tally > 0
                        ? " bg-green-50 w-fit px-7 py-1 rounded-md"
                        : " bg-red-50 w-fit px-7 py-1 rounded-md"
                    }`}
                  >
                    <td className={`px-6 py-4  whitespace-nowrap`}>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${
                          user.tally > 0
                            ? "text-green-600 font-bold bg-green-200 border border-green-500 w-fit px-7 py-1 rounded-md"
                            : "text-red-600 font-bold bg-red-200 border border-red-500 w-fit px-7 py-1 rounded-md"
                        }`}
                      >
                        {user.tally}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigateToUserDetail(user.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-4 text-gray-500">No users found</p>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Add New User
          </h3>
          <div className="flex items-center">
            <div className="flex-grow mr-4">
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Enter user name"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <button
              onClick={addUser}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center"
            >
              <PlusCircle className="mr-2" size={20} />
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
