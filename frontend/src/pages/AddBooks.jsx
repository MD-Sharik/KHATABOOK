import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Book, FileText, Check, X } from "lucide-react";
import Modal from "react-modal";

const AddBooks = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [name, setBookName] = useState("");
  const [description, setBookDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddBook = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "http://localhost:3000/booksCreate",
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Book created:", response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error adding book:", error);
      alert("Failed to add book. Please try again.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate(-1); // Navigate back
  };

  return (
    <div className="min-h-[92.4vh] bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Add New Book for User ID: {userId}
        </h1>

        <div className="mb-6">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="bookName"
          >
            Book Name
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Book className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="bookName"
              placeholder="Enter book name"
              value={name}
              onChange={(e) => setBookName(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="mb-6">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="description"
          >
            Description
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="description"
              placeholder="Enter book description"
              value={description}
              onChange={(e) => setBookDescription(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
              rows="3"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAddBook}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center"
          >
            <Check className="mr-2" size={20} />
            Add Book
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="max-w-md mx-auto mt-20 bg-white rounded-lg shadow-lg p-8"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Success!</h2>
        <p className="mb-6 text-gray-600">
          Book has been created successfully.
        </p>
        <div className="flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            Close
          </button>
        </div>
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      </Modal>
    </div>
  );
};

export default AddBooks;
