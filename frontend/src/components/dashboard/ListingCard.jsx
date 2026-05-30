import { motion } from "framer-motion";
import { StatusBadge } from "./StatusBadge";
import { MapPin, Calendar } from "lucide-react";

export const ListingCard = ({ book }) => {
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
      <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 relative">
        {book.front_image ? (
          <img src={book.front_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
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

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span className="flex items-center"><Calendar size={12} className="mr-1" /> {date}</span>
            <span className="flex items-center"><MapPin size={12} className="mr-1" /> {book.location.city || "N/A"}</span>
          </div>
          <StatusBadge status={book.status} />
        </div>
      </div>
    </motion.div>
  );
};
