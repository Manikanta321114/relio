import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";

export const EmptyUploadsState = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto mt-12 text-center p-10 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-3xl shadow-sm"
    >
      <div className="w-24 h-24 mx-auto bg-primary/5 rounded-full flex items-center justify-center mb-6">
        <BookOpen size={40} className="text-primary/40" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Start by uploading your first book 📚</h2>
      <p className="text-gray-500 mb-8 max-w-sm mx-auto">
        Turn your old books into cash and help other students find affordable reading materials.
      </p>
      <Button variant="primary" className="px-8" onClick={() => navigate("/sell-book")}>
        Sell a Book Now
      </Button>
    </motion.div>
  );
};
