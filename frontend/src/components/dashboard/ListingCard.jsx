import { motion } from "framer-motion";
import { StatusBadge } from "./StatusBadge";
import { MapPin, Calendar, Edit2, Trash2 } from "lucide-react";

const fallbackBookImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/%3E%3Cpath d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/%3E%3C/svg%3E";

export const ListingCard = ({ book, onEdit, onDelete }) => {
  const date = new Date(book.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 group"
    >
      {/* Image Thumbnail */}
      <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 relative flex items-center justify-center border border-gray-100">
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
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-primary transition-colors">{book.title}</h3>
            <p className="text-sm text-gray-500">{book.category} • {book.condition}</p>
          </div>
          <div className="text-right flex flex-col items-end shrink-0">
            {book.status === "approved" && book.seller_price && book.admin_price ? (
              <div className="space-y-1">
                <div className="text-xs text-gray-400 font-medium">Seller Price: <span className="line-through">₹{book.seller_price}</span></div>
                <div className="text-sm font-extrabold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">Approved Price: ₹{book.admin_price}</div>
                <div className="text-[10px] text-gray-500 font-bold pt-0.5">Negotiable: <span className={book.negotiable ? "text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100" : "text-gray-400"}>{book.negotiable ? "Yes" : "No"}</span></div>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <span className="text-lg font-bold text-gray-900">₹{book.price}</span>
                {book.negotiable && (
                  <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">Negotiable</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-50">
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span className="flex items-center"><Calendar size={12} className="mr-1" /> {date}</span>
            <span className="flex items-center"><MapPin size={12} className="mr-1" /> {book?.location?.city || "N/A"}</span>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <StatusBadge status={book.status} />
            {book.status !== "sold" && book.status !== "ordered" && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(book);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 border border-indigo-100"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Are you sure you want to delete this listing?")) {
                      onDelete?.(book.id || book._id);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 border border-red-100"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
