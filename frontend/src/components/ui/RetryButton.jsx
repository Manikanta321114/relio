import { motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import clsx from "clsx";

export const RetryButton = ({ onRetry, isRetrying, className, fullWidth }) => {
  return (
    <button
      onClick={onRetry}
      disabled={isRetrying}
      className={clsx(
        "flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all",
        "bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed",
        fullWidth && "w-full",
        className
      )}
    >
      <motion.div
        animate={isRetrying ? { rotate: 360 } : { rotate: 0 }}
        transition={isRetrying ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
      >
        <RefreshCcw size={18} />
      </motion.div>
      <span>{isRetrying ? "Retrying..." : "Try Again"}</span>
    </button>
  );
};
