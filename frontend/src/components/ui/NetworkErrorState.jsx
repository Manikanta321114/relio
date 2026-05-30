import { motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { RetryButton } from "./RetryButton";
import { useState } from "react";

export const NetworkErrorState = ({ onRetry, message = "Please check your internet connection and try again." }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full py-16 flex flex-col items-center justify-center text-center px-4"
    >
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 relative">
        <WifiOff size={40} className="text-gray-400" />
        <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Connection Lost</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        {message}
      </p>
      
      <RetryButton onRetry={handleRetry} isRetrying={isRetrying} />
    </motion.div>
  );
};
