import { motion } from "framer-motion";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";

export const SuccessState = ({ title, message, onReset }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto text-center p-8 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
        className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6 relative z-10"
      >
        <PackageCheck size={48} className="text-green-600" />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute -bottom-2 -right-2 bg-white rounded-full p-1"
        >
          <CheckCircle2 size={24} className="text-green-500 fill-green-100" />
        </motion.div>
      </motion.div>

      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-gray-900 mb-3 relative z-10"
      >
        {title}
      </motion.h2>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-gray-500 mb-8 relative z-10"
      >
        {message}
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3 relative z-10"
      >
        <Button variant="primary" fullWidth onClick={() => navigate("/my-uploads")}>
          View My Uploads
        </Button>
        {onReset && (
          <Button variant="ghost" fullWidth onClick={onReset}>
            Upload Another Book
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
};
