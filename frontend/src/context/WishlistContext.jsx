import { createContext, useState, useEffect, useContext } from "react";
import { wishlistService } from "../services/wishlistService";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlistIds = async () => {
    if (!user) {
      setWishlistIds([]);
      return;
    }
    try {
      setIsLoading(true);
      const ids = await wishlistService.getWishlistIds();
      setWishlistIds(ids);
    } catch (error) {
      console.error("Failed to load wishlist IDs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistIds();
  }, [user]);

  const toggleWishlist = async (bookId) => {
    if (!user) {
      toast.error("Please login to add books to your wishlist!");
      return null;
    }
    try {
      const data = await wishlistService.toggleLike(bookId);
      if (data.liked) {
        setWishlistIds((prev) => [...prev, bookId]);
        toast.success("Added to wishlist ❤️");
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== bookId));
        toast.success("Removed from wishlist");
      }
      return data;
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      toast.error("Failed to update wishlist");
      return null;
    }
  };

  const clearAllWishlist = async () => {
    if (!user) return;
    try {
      await wishlistService.clearWishlist();
      setWishlistIds([]);
      toast.success("Wishlist cleared successfully");
    } catch (error) {
      console.error("Failed to clear wishlist:", error);
      toast.error("Failed to clear wishlist");
    }
  };

  const isLiked = (bookId) => wishlistIds.includes(bookId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        isLoading,
        toggleWishlist,
        clearAllWishlist,
        isLiked,
        refreshWishlist: fetchWishlistIds
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
