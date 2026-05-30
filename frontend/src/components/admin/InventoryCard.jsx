import { motion } from "framer-motion";
import { Package, Truck, CheckCircle2, Box } from "lucide-react";

export const InventoryCard = ({ order }) => {
  const getStageIcon = () => {
    switch (order.status) {
      case "collected": return <Box className="w-6 h-6 text-purple-500" />;
      case "packed": return <Package className="w-6 h-6 text-indigo-500" />;
      case "shipped": return <Truck className="w-6 h-6 text-amber-500" />;
      case "delivered": return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      default: return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStageBg = () => {
    switch (order.status) {
      case "collected": return "bg-purple-50 border-purple-100";
      case "packed": return "bg-indigo-50 border-indigo-100";
      case "shipped": return "bg-amber-50 border-amber-100";
      case "delivered": return "bg-green-50 border-green-100";
      default: return "bg-gray-50 border-gray-100";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={`rounded-2xl p-5 border shadow-sm flex items-start space-x-4 ${getStageBg()}`}
    >
      <div className="w-16 h-20 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden shrink-0">
        {order.book_image ? (
          <img src={order.book_image} alt={order.book_title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-gray-900 truncate pr-4">{order.book_title}</h4>
          <div className="shrink-0">{getStageIcon()}</div>
        </div>
        
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <p><span className="font-medium text-gray-900">Order ID:</span> {order.id.slice(-6).toUpperCase()}</p>
          <p className="truncate"><span className="font-medium text-gray-900">Buyer:</span> {order.buyer_name}</p>
          <p className="text-xs text-gray-400 mt-2">
            Last Updated: {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
