import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { marketplaceService } from "../../services/marketplaceService";
import { ShieldCheck, Calendar, ArrowLeft, Heart, Share2, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { MarketplaceBookCard } from "../../components/marketplace/MarketplaceBookCard";
import toast from "react-hot-toast";
import { orderService } from "../../services/orderService";
import { useWishlist } from "../../context/WishlistContext";
import { wishlistService } from "../../services/wishlistService";

export const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  
  // Image Gallery States
  const [activeImage, setActiveImage] = useState(null);
  const [showZoomModal, setShowZoomModal] = useState(false);
  
  // Wishlist & Share States
  const { isLiked, toggleWishlist } = useWishlist();
  const [showShareModal, setShowShareModal] = useState(false);
  const isBookLiked = book ? isLiked(book.id) : false;

  useEffect(() => {
    fetchBookDetails();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (book) {
      setActiveImage(book.front_image);
    }
  }, [book]);

  const fetchBookDetails = async () => {
    try {
      setIsLoading(true);
      const data = await marketplaceService.getBookById(id);
      setBook(data);
      
      // Fetch related books in the same category
      const related = await marketplaceService.getBooks({ category: data.category, limit: 4 });
      setRelatedBooks(related.books.filter(b => b.id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load book details");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeartClick = async () => {
    const res = await toggleWishlist(book.id);
    if (res) {
      setBook(prev => ({ ...prev, wishlist_count: res.wishlist_count }));
    }
  };

  const handleShareClick = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${book.title} on Relio for ₹${book.price}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: shareText,
          url: shareUrl
        });
        const res = await wishlistService.incrementShareCount(book.id);
        setBook(prev => ({ ...prev, share_count: res.share_count }));
        toast.success("Shared successfully!");
      } catch (err) {
        console.log("Share sheet dismissed or failed:", err);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleBuyClick = () => {
    navigate(`/checkout/${book.id}`);
  };

  const handleRent = () => {
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex flex-col border border-gray-100 p-5 z-50"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">📚 Rental Service Coming Soon</h3>
            <p className="text-sm text-gray-500">We are working on a seamless rental system. Stay tuned for future updates.</p>
          </div>
          <button onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-full ml-4">
            <X size={16} />
          </button>
        </div>
      </motion.div>
    ), { duration: 4000 });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded mb-8" />
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2 h-[500px] bg-gray-200 rounded-3xl" />
          <div className="w-full md:w-1/2 space-y-6 pt-4">
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-20 bg-gray-200 rounded w-full" />
            <div className="h-12 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) return null;

  const date = new Date(book.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="max-w-6xl mx-auto py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-500 hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Marketplace
      </button>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        {/* Images */}
        <div className="w-full lg:w-1/2 space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setShowZoomModal(true)}
            className="w-full h-[400px] md:h-[500px] bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative group cursor-zoom-in"
          >
            {activeImage ? (
              <img src={activeImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
            )}
            
            {/* Zoom Icon Overlay on Hover */}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <div className="p-4 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-primary scale-90 group-hover:scale-100 transition-transform duration-300">
                <ZoomIn size={24} />
              </div>
            </div>

            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center shadow-md">
              <ShieldCheck size={16} className="text-primary mr-1.5" />
              <span className="text-xs font-bold text-primary">Verified by Relio</span>
            </div>
          </motion.div>
          
          {/* Cover Thumbnails */}
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveImage(book.front_image)}
              className={`w-24 h-24 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all shadow-sm hover:scale-105 duration-200 focus:outline-none ${
                activeImage === book.front_image ? "border-primary scale-102" : "border-gray-200 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={book.front_image} className="w-full h-full object-cover" alt="Front Cover Thumbnail" />
            </button>
            
            {book.back_image && (
              <button 
                onClick={() => setActiveImage(book.back_image)}
                className={`w-24 h-24 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all shadow-sm hover:scale-105 duration-200 focus:outline-none ${
                  activeImage === book.back_image ? "border-primary scale-102" : "border-gray-200 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={book.back_image} className="w-full h-full object-cover" alt="Back Cover Thumbnail" />
              </button>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="w-full lg:w-1/2 flex flex-col pt-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
              {book.category}
            </span>
            <div className="flex gap-2 text-gray-400">
              <button 
                onClick={handleHeartClick}
                className="p-2 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
                aria-label={isBookLiked ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={20} className={isBookLiked ? "fill-red-500 text-red-500 animate-bounce" : ""} />
              </button>
              <button 
                onClick={handleShareClick}
                className="p-2 hover:text-primary hover:bg-primary/5 rounded-full transition-colors focus:outline-none"
                aria-label="Share listing"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">{book.title}</h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-6 select-none">
            <span className="flex items-center"><Calendar size={16} className="mr-1.5" /> {date}</span>
            <span className="flex items-center text-red-500 font-semibold">
              <Heart size={16} className="fill-red-500 mr-1.5 animate-pulse" /> 
              {book.wishlist_count || 0} {book.wishlist_count === 1 ? "Wishlist Save" : "Wishlist Saves"}
            </span>
            <span className="flex items-center text-primary font-semibold">
              <Share2 size={16} className="mr-1.5" /> 
              {book.share_count || 0} {book.share_count === 1 ? "Share" : "Shares"}
            </span>
          </div>

          <div className="mb-8">
            <span className="text-sm text-gray-500 block mb-1">Expected Price</span>
            <div className="flex items-end text-green-600">
              <span className="text-3xl font-medium mr-1">₹</span>
              <span className="text-5xl font-bold tracking-tight">{book.price}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">{book.category}</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">{book.condition}</span>
              {book.status === 'sold' && (
                <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-bold uppercase">Out of Stock</span>
              )}
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {book.description || "No description provided by the seller."}
            </p>
          </div>

          <div className="flex gap-4 mt-auto">
            <Button 
              variant="primary" 
              className={`flex-1 py-4 text-lg font-bold ${book.status === 'sold' ? 'opacity-50 cursor-not-allowed bg-gray-400 border-gray-400 hover:bg-gray-400' : 'shadow-xl shadow-primary/20'}`} 
              onClick={handleBuyClick}
              disabled={book.status === 'sold'}
            >
              {book.status === 'sold' ? 'Out of Stock' : 'Buy Now'}
            </Button>
            <Button variant="outline" className="flex-1 py-4 text-lg font-bold bg-white" onClick={handleRent}>
              Rent Book
            </Button>
          </div>
        </div>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <div className="border-t border-gray-100 pt-16 mt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Similar Books in {book.category}</h2>
            <button className="text-primary font-medium hover:text-primary/80 transition-colors">View All</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedBooks.map(rb => (
              <MarketplaceBookCard key={rb.id} book={rb} />
            ))}
          </div>
        </div>
      )}

      {/* Premium Full-Screen Image Zoom & Navigation Modal */}
      <AnimatePresence>
        {showZoomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowZoomModal(false)}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-200 z-50"
              aria-label="Close zoom preview"
            >
              <X size={24} />
            </button>

            {/* Left Control Button */}
            {book.back_image && (
              <button
                onClick={() => {
                  setActiveImage(activeImage === book.front_image ? book.back_image : book.front_image);
                }}
                className="absolute left-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-200 hover:scale-110 z-50"
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {/* Main Zoomed Image Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl relative flex items-center justify-center"
            >
              <img
                src={activeImage}
                alt={book.title}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl select-none"
              />
            </motion.div>

            {/* Right Control Button */}
            {book.back_image && (
              <button
                onClick={() => {
                  setActiveImage(activeImage === book.front_image ? book.back_image : book.front_image);
                }}
                className="absolute right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-200 hover:scale-110 z-50"
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
            )}

            {/* Image Indicator */}
            {book.back_image && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-semibold flex items-center gap-3 select-none">
                <span className={activeImage === book.front_image ? "text-primary font-bold" : "opacity-70"}>Front</span>
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                <span className={activeImage === book.back_image ? "text-primary font-bold" : "opacity-70"}>Back</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Share Fallback Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm shadow-inner"
              onClick={() => setShowShareModal(false)}
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-gray-100 z-10 flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>📤 Share Book Listing</span>
                </h3>
                <button 
                  onClick={() => setShowShareModal(false)} 
                  className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-all focus:outline-none"
                >
                  <X size={16} />
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">Copy the listing link below to share with your friends:</p>
              
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 mb-6 select-all">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  className="bg-transparent border-none text-sm text-gray-700 w-full focus:outline-none cursor-text font-mono"
                />
              </div>

              <div className="flex gap-3 mt-auto">
                <Button 
                  variant="outline" 
                  className="flex-1 py-3 text-sm font-semibold border-gray-200 hover:bg-gray-50 rounded-xl"
                  onClick={() => setShowShareModal(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1 py-3 text-sm font-semibold rounded-xl text-white shadow-lg shadow-primary/20 bg-primary border-primary hover:bg-primary/95"
                  onClick={async () => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Book link copied successfully");
                    try {
                      const res = await wishlistService.incrementShareCount(book.id);
                      setBook(prev => ({ ...prev, share_count: res.share_count }));
                    } catch (e) {
                      console.error("Failed to increment share count:", e);
                    }
                    setShowShareModal(false);
                  }}
                >
                  Copy
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
