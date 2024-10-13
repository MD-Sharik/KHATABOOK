// src/pages/UserDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";
import {
  PlusCircle,
  MinusCircle,
  IndianRupee,
  FileText,
  X,
} from "lucide-react";
Modal.setAppElement("#root");
const UserDetail = () => {
  const { userId } = useParams();
  const location = useLocation();
  const { bookId } = location.state || {};
  const [tally, setTally] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("give");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const fetchAccountingDetails = async () => {
      if (!bookId) {
        console.error("bookId is undefined");
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/books/${bookId}/users/${userId}/accounting`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTransactions(response.data.transactions);
        setTally(response.data.tally);
      } catch (error) {
        console.error("Error fetching accounting details:", error);
      }
    };
    fetchAccountingDetails();
  }, [bookId, userId]);

  const handleTransaction = async () => {
    if (!bookId) {
      console.error("bookId is undefined");
      return;
    }
    const amountToSend = parseFloat(amount);
    if (isNaN(amountToSend)) {
      console.error("Invalid amount");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3000/users/${userId}/accounting`,
        {
          amount: amountToSend,
          type: transactionType,
          remarks,
          bookId: parseInt(bookId, 10),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions([...transactions, response.data.transaction]);
      setTally(response.data.tally);
      closeModal();
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to update transaction. Please try again.");
    }
  };

  const openModal = (type) => {
    setTransactionType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setAmount("");
    setRemarks("");
  };

  if (!bookId) {
    return (
      <div className="text-center text-red-600 text-xl mt-10">
        Error: Book ID not found
      </div>
    );
  }

  return (
    <div className="min-h-[92.4vh] bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          User Accounting
        </h1>

        <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">TALLY</h2>
          <div
            className={`text-4xl font-bold ${
              tally >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {tally >= 0
              ? `₹${Math.abs(tally).toFixed(2)}`
              : `-₹${Math.abs(tally).toFixed(2)}`}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {tally >= 0 ? "You are owed" : "You owe"}
          </div>
        </div>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => openModal("get")}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center"
          >
            <PlusCircle className="mr-2" size={20} />
            Get Amount
          </button>
          <button
            onClick={() => openModal("give")}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 flex items-center justify-center"
          >
            <MinusCircle className="mr-2" size={20} />
            Give Amount
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Transaction History
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {transactions.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tx.type === "get"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tx.type === "get" ? "will get" : " will give"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{Math.abs(tx.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-4 text-gray-500">
              No transactions found
            </p>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        className="max-w-md mx-auto mt-20 bg-white rounded-lg shadow-lg p-8"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          {transactionType === "give" ? "Add Expense" : "Add Income"}
        </h2>
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="amount"
          >
            Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IndianRupee className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="amount"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="mb-6">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="remarks"
          >
            Remarks
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="remarks"
              placeholder="Add any notes here"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
              rows="3"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleTransaction}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            Submit
          </button>
          <button
            onClick={closeModal}
            className="ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
          >
            Cancel
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

export default UserDetail;
