import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "../ui/Button";

export const ApprovalCard = ({ book, onApprove, onReject, onViewDetails, isProcessing }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
    >
      <div 
        className="aspect-[4/3] bg-gray-100 relative cursor-pointer overflow-hidden"
        onClick={() => onViewDetails(book)}
      >
        {book.front_image ? (
          <img 
            src={book.front_image} 
            alt={book.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-900 shadow-sm">
          ${book.price.toFixed(2)}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 
              className="text-lg font-bold text-gray-900 line-clamp-1 hover:text-primary cursor-pointer transition-colors"
              onClick={() => onViewDetails(book)}
            >
              {book.title}
            </h3>
          </div>
          <p className="text-sm text-gray-500 mb-3">{book.author}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
              {book.category}
            </span>
            {book.subcategory && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                {book.subcategory}
              </span>
            )}
            {book.year_of_publication && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                {book.year_of_publication}
              </span>
            )}
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
              {book.condition}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50">
          <Button 
            disabled={isProcessing}
            onClick={() => onViewDetails(book)}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl shadow-sm"
          >
            Review Book
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
