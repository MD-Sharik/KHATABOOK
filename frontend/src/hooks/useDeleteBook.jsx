import axios from "axios";
import { useState } from "react";

function useDeleteBook() {
  const [delloading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteBook = async (bookId, token) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/deleteBook",
        { bookId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(bookId);
      if (response.status === 200) {
        console.log("Book deleted successfully");
        return true;
      } else {
        throw new Error("Error deleting book");
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteBook, delloading, error };
}

export default useDeleteBook;
