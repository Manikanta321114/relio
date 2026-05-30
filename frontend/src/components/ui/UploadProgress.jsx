import { motion } from "framer-motion";

export const UploadProgress = ({ progress, statusText }) => {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -ml-16 -mb-16" />
      
      <div className="relative z-10">
        <h3 className="font-bold text-gray-900 mb-2">{statusText}</h3>
        
        <div className="flex items-center justify-between text-sm font-medium mb-3">
          <span className="text-gray-500">Progress</span>
          <span className="text-primary">{progress}%</span>
        </div>
        
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};
