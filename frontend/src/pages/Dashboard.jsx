import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Book, PlusCircle, Loader } from "lucide-react";
import useDeleteBook from "../hooks/useDeleteBook";
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const id = localStorage.getItem("userId");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setUser({ id: userId });
    fetchBooks();
  }, []);

  const token = localStorage.getItem("token");
  const { deleteBook, delloading, error } = useDeleteBook();
  const fetchBooks = async () => {
    try {
      const response = await axios.get("http://localhost:3000/books", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
  const bookId = books.id;
  const handleDeleteBook = async (bookId) => {
    const success = await deleteBook(bookId, token);
    if (success) {
      // Remove the deleted book from the state
      setBooks(books.filter((book) => book.id !== bookId));
    } else {
      alert("Failed to delete book. Please try again.");
    }
  };
  // console.log(`Book ${bookId}`);
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-4">
          Dashboard
        </h1>
        {user ? (
          <p className="text-lg text-center text-gray-600 mb-8">
            Welcome, User ID: {user.id}
          </p>
        ) : (
          <p className="text-lg text-center text-gray-600 mb-8">Loading...</p>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
            <Book className="mr-2" size={24} />
            Your Books
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader className="animate-spin text-blue-500" size={32} />
            </div>
          ) : books.length > 0 ? (
            <ul className="space-y-4">
              {books.map((book) => (
                <li key={book.id}>
                  <div
                    // to={`/books/${book.id}/`}
                    className=" bg-blue-50 flex justify-between   hover:bg-blue-100 rounded-lg p-3 transition duration-200"
                  >
                    <Link to={`/books/${book.id}/`}>
                      <h3 className="text-xl font-semibold text-blue-700 mb-2">
                        {book.name}
                      </h3>
                      <p className="text-gray-600">{book.description}</p>
                    </Link>

                    <div className="bg-red-500 text-white rounded-md flex items-center justify-center px-2">
                      <button
                        onClick={() => {
                          handleDeleteBook(book.id);
                        }}
                        disabled={delloading}
                      >
                        {loading ? "Deleting..." : "Delete"}
                      </button>
                      {error && <p>Error: {error.message}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No books found</p>
          )}
        </div>

        <div className="text-center">
          <Link
            to={`/addbooks/${id}`}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
          >
            <PlusCircle className="mr-2" size={20} />
            Add New Book
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
