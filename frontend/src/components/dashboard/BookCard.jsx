import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Button } from "../ui/Button";

export const BookCard = ({ book, onRentClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 w-64 flex-shrink-0 group"
    >
      <div className="relative h-48 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
        {/* Mock Book Image */}
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-inner flex items-center justify-center">
          <span className="text-gray-400 font-medium text-sm text-center px-2">{book.title}</span>
        </div>
        
        {/* Verified Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center shadow-sm">
          <ShieldCheck size={14} className="text-primary mr-1" />
          <span className="text-[10px] font-bold text-primary">VERIFIED</span>
        </div>
        
        {/* Condition Badge */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
          <span className="text-[10px] font-medium text-white">{book.condition}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 line-clamp-1 mb-1 group-hover:text-primary transition-colors">{book.title}</h4>
        <p className="text-xs text-gray-500 mb-3">{book.category}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-gray-900">₹{book.price}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onRentClick}>
            Rent
          </Button>
          <Button variant="primary" size="sm">
            Buy Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
