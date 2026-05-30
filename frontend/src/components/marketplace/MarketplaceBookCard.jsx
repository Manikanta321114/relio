import { motion } from "framer-motion";
import { ShieldCheck, X, Heart } from "lucide-react";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { orderService } from "../../services/orderService";
import { useWishlist } from "../../context/WishlistContext";

export const MarketplaceBookCard = ({ book }) => {
  const navigate = useNavigate();
  const { isLiked, toggleWishlist } = useWishlist();
  const isBookLiked = isLiked(book.id);

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/books/${book.id}`);
  };

  const handleBuyClick = (e) => {
    e.stopPropagation();
    if (book.status === 'sold') return;
    navigate(`/checkout/${book.id}`);
  };

  const handleHeartClick = (e) => {
    e.stopPropagation();
    toggleWishlist(book.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/books/${book.id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 w-full flex flex-col group cursor-pointer"
    >
      <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-50 flex items-center justify-center">
        {book.front_image ? (
          <img src={book.front_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
        )}
        
        {/* Wishlist Toggle Button */}
        <button
          onClick={handleHeartClick}
          className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform duration-200 text-gray-400 hover:text-red-500 z-10 focus:outline-none"
          aria-label={isBookLiked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} className={isBookLiked ? "fill-red-500 text-red-500" : ""} />
        </button>

        {/* Verified Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center shadow-sm">
          <ShieldCheck size={14} className="text-primary mr-1" />
          <span className="text-[10px] font-bold text-primary">Verified by Relio</span>
        </div>
        
        {/* Condition Badge */}
        <div className={`absolute bottom-3 left-3 backdrop-blur-md px-2 py-1 rounded-md ${
          book.condition?.toLowerCase() === 'like new' ? 'bg-green-500/90 text-white' :
          book.condition?.toLowerCase() === 'good' ? 'bg-blue-500/90 text-white' :
          'bg-orange-500/90 text-white'
        }`}>
          <span className="text-[10px] font-medium">{book.condition}</span>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">{book.title}</h3>
          {book.status === 'sold' && (
            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full whitespace-nowrap">
              OUT OF STOCK
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{book.description}</p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl font-bold text-green-600">₹{book.price}</span>
            {book.negotiable && (
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-1 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                🏷️ Price Negotiable
              </span>
            )}
          </div>

          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              className="flex-1 px-2 py-2 text-sm font-semibold"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
            <Button 
              variant="primary" 
              className={`flex-1 px-2 py-2 text-sm font-semibold ${book.status === 'sold' ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleBuyClick}
              disabled={book.status === 'sold'}
            >
              {book.status === 'sold' ? 'Sold Out' : 'Buy Now'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
