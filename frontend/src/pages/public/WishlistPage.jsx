import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Heart, HelpCircle } from "lucide-react";
import { MarketplaceBookCard } from "../../components/marketplace/MarketplaceBookCard";
import { SkeletonBookCard } from "../../components/skeletons/SkeletonBookCard";
import { wishlistService } from "../../services/wishlistService";
import { useWishlist } from "../../context/WishlistContext";
import { Button } from "../../components/ui/Button";

export const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlistIds, clearAllWishlist } = useWishlist();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    fetchWishlistBooks();
  }, []);

  // Filter books dynamically when any item gets unliked from context
  useEffect(() => {
    if (books.length > 0) {
      setBooks((prev) => prev.filter((b) => wishlistIds.includes(b.id)));
    }
  }, [wishlistIds]);

  const fetchWishlistBooks = async () => {
    try {
      setIsLoading(true);
      const data = await wishlistService.getWishlist();
      setBooks(data);
    } catch (error) {
      console.error("Failed to load wishlist details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    await clearAllWishlist();
    setBooks([]);
    setShowConfirmClear(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate("/marketplace")} 
        className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to Marketplace
      </button>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            ❤️ My Wishlist
          </h1>
          <p className="text-gray-500 mt-1">Keep track of all your favorite reads.</p>
        </div>

        {books.length > 0 && (
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold flex items-center gap-2 px-4 py-2.5 rounded-xl self-start sm:self-auto"
            onClick={() => setShowConfirmClear(true)}
          >
            <Trash2 size={16} />
            Remove All
          </Button>
        )}
      </div>

      {/* Wishlist Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBookCard key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-gray-50/50 border border-dashed border-gray-200 rounded-3xl p-8"
        >
          <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <Heart size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Explore pre-loved academic, competitive, and novel listings and tap the heart icon to save them here.</p>
          <Button variant="primary" onClick={() => navigate("/marketplace")} className="px-6 py-2.5 font-bold shadow-lg shadow-primary/20">
            Browse Marketplace
          </Button>
        </motion.div>
      ) : (
        <motion.div 
          layout 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {books.map((book) => (
              <MarketplaceBookCard key={book.id} book={book} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Beautiful Glassmorphism Remove All Confirmation Modal */}
      <AnimatePresence>
        {showConfirmClear && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowConfirmClear(false)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-gray-100 flex flex-col items-center text-center z-10"
            >
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <HelpCircle size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Remove all wishlist items?</h3>
              <p className="text-gray-500 text-sm mb-6">This action will clear all books from your personal wishlist permanently.</p>
              
              <div className="flex gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1 py-3 text-sm font-semibold border-gray-200 hover:bg-gray-50 rounded-xl"
                  onClick={() => setShowConfirmClear(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1 py-3 text-sm font-semibold bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700 shadow-lg shadow-red-600/15 rounded-xl text-white"
                  onClick={handleClearAll}
                >
                  Remove All
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
