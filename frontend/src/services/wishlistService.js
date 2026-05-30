import api from "./api";

export const wishlistService = {
  /**
   * Toggle liked state for a given book
   */
  toggleLike: async (bookId) => {
    const response = await api.post("/wishlist/", { book_id: bookId });
    return response.data; // { liked: boolean, wishlist_count: number, message: string }
  },

  /**
   * Fetch full details of all wishlisted books
   */
  getWishlist: async () => {
    const response = await api.get("/wishlist/");
    return response.data;
  },

  /**
   * Fetch a list of IDs of wishlisted books for quick icon mapping
   */
  getWishlistIds: async () => {
    const response = await api.get("/wishlist/ids");
    return response.data;
  },

  /**
   * Remove all books from the wishlist
   */
  clearWishlist: async () => {
    const response = await api.delete("/wishlist/clear");
    return response.data;
  },

  /**
   * Record that a book has been shared
   */
  incrementShareCount: async (bookId) => {
    const response = await api.post(`/books/${bookId}/share`);
    return response.data; // { share_count: number, message: string }
  }
};
