import api from "./api";

export const bookService = {
  /**
   * Create a new book listing
   * @param {Object} bookData - Complete book details
   * @returns {Promise<Object>} Created book data
   */
  createBook: async (bookData) => {
    const response = await api.post("/books/", bookData);
    return response.data;
  },

  /**
   * Fetch user's uploaded books
   * @returns {Promise<Array>} List of books
   */
  getMyUploads: async () => {
    const response = await api.get("/books/my-uploads");
    return response.data;
  }
};
