import { motion, AnimatePresence } from "framer-motion";
import { Rocket, X } from "lucide-react";
import { Button } from "../ui/Button";

export const RentModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center overflow-hidden"
        >
          {/* Decorative background blur */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mb-6">
              <Rocket size={40} className="text-secondary" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h3>
            <p className="text-gray-500 mb-8">
              The book rental feature is currently under development and will be available very soon. Stay tuned! 🚀
            </p>
            
            <Button fullWidth onClick={onClose} variant="primary">
              Got it
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
