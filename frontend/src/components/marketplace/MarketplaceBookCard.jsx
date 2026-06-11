import { motion } from "framer-motion";
import { ShieldCheck, X, Heart } from "lucide-react";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { orderService } from "../../services/orderService";
import { useWishlist } from "../../context/WishlistContext";

const fallbackBookImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/%3E%3Cpath d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/%3E%3C/svg%3E";

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
          <img 
            src={book.front_image} 
            alt={book.title} 
            onError={(e) => { e.target.src = fallbackBookImage; }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <img src={fallbackBookImage} className="w-12 h-12 object-contain opacity-55" alt="" />
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
            <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-1 rounded-full whitespace-nowrap uppercase tracking-wider">
              SOLD
            </span>
          )}
        </div>
        
        {(book.subcategory || book.year_of_publication) && (
          <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {book.subcategory && <span>{book.subcategory}</span>}
            {book.subcategory && book.year_of_publication && <span>•</span>}
            {book.year_of_publication && <span>{book.year_of_publication}</span>}
          </div>
        )}
        
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
            {book.status === 'sold' ? (
              <Button 
                variant="outline" 
                className="w-full py-2 text-sm font-semibold text-red-500 border-red-200 bg-red-50 hover:bg-red-50 cursor-default"
                onClick={handleViewDetails}
              >
                View Details (SOLD)
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="flex-1 px-2 py-2 text-sm font-semibold"
                  onClick={handleViewDetails}
                >
                  View Details
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1 px-2 py-2 text-sm font-semibold"
                  onClick={handleBuyClick}
                >
                  Buy Now
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
