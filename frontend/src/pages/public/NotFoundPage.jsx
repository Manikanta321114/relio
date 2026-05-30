import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { PageTransition } from "../../components/ui/PageTransition";

export const NotFoundPage = () => {
  return (
    <PageTransition className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center relative">
        {/* Animated Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <h1 className="text-9xl font-black text-gray-900 tracking-tighter mb-4">
            4<span className="text-primary">0</span>4
          </h1>
        </motion.div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page not found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link to="/marketplace">
          <Button variant="primary" className="px-8 py-4 shadow-xl shadow-primary/20 hover:scale-105 transition-transform duration-300">
            <ArrowLeft className="mr-2 h-5 w-5 inline" />
            Back to Marketplace
          </Button>
        </Link>
      </div>
    </PageTransition>
  );
};
