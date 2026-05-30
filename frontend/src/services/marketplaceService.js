import api from "./api";

export const marketplaceService = {
  /**
   * Fetch approved books with filters and pagination
   */
  getBooks: async (params = {}) => {
    // Clean empty params
    const query = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== "")
    );
    
    const response = await api.get("/books/", { params: query });
    return response.data;
  },

  /**
   * Fetch a single approved book by ID
   */
  getBookById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  }
};
