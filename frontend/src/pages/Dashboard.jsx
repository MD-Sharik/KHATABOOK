import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Book, PlusCircle, Loader, User, BarChart2 } from "lucide-react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const id = localStorage.getItem("userId");
  const name = localStorage.getItem("userName");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setUser({ id: userId });
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:3000/books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched Books:", response.data);
      setBooks(response.data);
      setLoading(false);
    } catch (error) {
      console.error(
        "Error fetching books:",
        error.response ? error.response.data : error
      );
      setLoading(false);
    }
  };

  const calculateGrandTotal = (transactions) => {
    const total = transactions
      .filter((transaction) => transaction && transaction.amount != null)
      .reduce((total, transaction) => {
        const amount = transaction.amount;
        const isGive = transaction.type === "give";

        return isGive ? total - amount : total + amount;
      }, 0);
    return total;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-8">
      <div className="max-w-5xl mx-auto">
        <header className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-4xl font-bold text-center text-blue-700 mb-4">
            Apna Khata!
          </h1>
          {user ? (
            <div className="flex items-center justify-center space-x-2 text-lg text-gray-600">
              <User size={24} />
              <p>
                Welcome{" "}
                <span className="font-semibold">{name.toUpperCase()}</span>!
              </p>
            </div>
          ) : (
            <p className="text-lg text-center text-gray-600">Loading...</p>
          )}
        </header>

        <main className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
            <Book className="mr-2 text-blue-600" size={28} />
            Your Khata's
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader className="animate-spin text-blue-500" size={32} />
            </div>
          ) : books.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {books.map((book, i) => {
                const transactions = book.transactions || [];
                const grandTotal = calculateGrandTotal(transactions);
                return (
                  <li key={i}>
                    <Link
                      to={`/books/${book.id}/`}
                      className="block bg-gradient-to-br  from-blue-50/50 to-blue-100/50 hover:from-blue-100/50 hover:to-blue-200/50 rounded-xl p-6 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex justify-between h-full">
                        <div className="flex-grow  ">
                          <h3 className="text-2xl font-semibold text-blue-700 mb-2">
                            {book.name}
                          </h3>
                          <Tippy
                            className="bg-black/80 shadow-lg shadow-black/30"
                            content={
                              book.description
                                ? book.description
                                : "Description not found"
                            }
                            placement="left"
                          >
                            <p
                              className="text-gray-400 font-medium   text-nowrap  overflow-hidden text-ellipsis"
                              title={
                                book.description
                                  ? book.description
                                  : "Description not found"
                              } // This will show the full text on hover
                            >
                              {book.description
                                ? book.description
                                : "Description not found"}
                            </p>
                          </Tippy>
                        </div>
                        <div className="flex flex-col  items-end justify-between">
                          <div
                            className={`text-lg font-bold px-4 py-1 rounded-full ${
                              grandTotal >= 0
                                ? "bg-green-200 text-green-700"
                                : "bg-red-200 text-red-700"
                            }`}
                          >
                            ₹{grandTotal.toFixed(2)}
                          </div>
                          <div className="text-sm  text-gray-500 flex items-center">
                            <BarChart2 size={16} className="mr-1" />
                            Transactions: {transactions.length}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-xl text-gray-500 mb-4">No books found</p>
              <p className="text-gray-400">
                Start by adding a new financial book!
              </p>
            </div>
          )}
        </main>

        <div className="text-center">
          <Link
            to={`/addbooks/${id}`}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          >
            <PlusCircle className="mr-2" size={20} />
            Add New Financial Book
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
