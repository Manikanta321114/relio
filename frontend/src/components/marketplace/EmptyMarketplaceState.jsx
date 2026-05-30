import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { Button } from "../ui/Button";

export const EmptyMarketplaceState = ({ onReset }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full py-16 text-center"
    >
      <div className="w-24 h-24 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <SearchX size={40} className="text-gray-300" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">No books found 📚</h2>
      <p className="text-gray-500 mb-8 max-w-sm mx-auto">
        We couldn't find any books matching your current filters. Try adjusting your search criteria.
      </p>
      <Button variant="ghost" onClick={onReset} className="border border-gray-200">
        Clear All Filters
      </Button>
    </motion.div>
  );
};
