import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Clock, Tag } from "lucide-react";
import { Button } from "../ui/Button";

export const ReviewModal = ({ isOpen, onClose, book, onApprove, onReject, isProcessing }) => {
  const [approvedPrice, setApprovedPrice] = useState(0);
  const [negotiable, setNegotiable] = useState(false);

  useEffect(() => {
    if (book) {
      setApprovedPrice(book.price);
      setNegotiable(book.negotiable || false);
    }
  }, [book]);

  if (!book) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh] border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Review Listing Spec & Price</h2>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Images */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 text-center">Front Cover</span>
                      <div className="aspect-[3/4] rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center">
                        {book.front_image ? (
                          <img src={book.front_image} alt="Front Cover" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400">No Image</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 text-center">Back Cover</span>
                      <div className="aspect-[3/4] rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center">
                        {book.back_image ? (
                          <img src={book.back_image} alt="Back Cover" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400 italic">No Back Cover</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <Clock size={14} />
                      <span>Uploaded {new Date(book.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{book.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 font-semibold">Author: <span className="text-gray-800">{book.author || "Unknown"}</span></p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                      {book.category}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                      {book.condition}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Seller Notes & Description</h4>
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {book.description || "No description provided."}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Seller Pickup & Contact Details</h4>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2.5 text-sm">
                      <p className="flex justify-between"><span className="text-gray-500">Seller Name:</span> <span className="font-bold text-gray-800">{book.seller_name || "Unknown"}</span></p>
                      <p className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-bold text-blue-600">{book.seller_phone || "N/A"}</span></p>
                      <div>
                        <span className="text-gray-500 block mb-1">Pickup Destination Address:</span>
                        <span className="text-gray-600 block text-xs bg-white p-2.5 rounded-xl border border-gray-100 leading-relaxed font-semibold">{book.seller_pickup_address || "Not Available"}</span>
                      </div>
                    </div>
                  </div>

                  {/* PRICING & COST MANAGEMENT */}
                  <div className="pt-4 flex flex-col gap-4 border-t border-gray-100">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Seller Asking Price</p>
                        <p className="text-2xl font-black text-gray-700 mt-1">₹{book.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Spec Condition</p>
                        <p className="text-sm font-bold text-orange-600 mt-1">{book.condition}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-2">
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                        <Tag size={12} /> Admin Final Selling Price (₹) *
                      </label>
                      <input 
                        type="number" 
                        value={approvedPrice} 
                        onChange={(e) => setApprovedPrice(parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-250 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-black text-primary bg-white shadow-inner" 
                        placeholder="e.g. 120"
                        min="1"
                      />
                      <p className="text-[10px] text-gray-400">This price will be displayed live in the marketplace and charged to the buyer.</p>
                    </div>

                    {/* Negotiable Option */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Marketplace Negotiation Status
                        </label>
                        <p className="text-[10px] text-gray-400 mt-0.5">Toggle to display a "Price Negotiable" badge in public listings.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={negotiable}
                          onChange={(e) => setNegotiable(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        <span className="ml-3 text-sm font-bold text-gray-700">{negotiable ? "Negotiable" : "Not Negotiable"}</span>
                      </label>
                    </div>

                    {parseFloat(approvedPrice) !== parseFloat(book.price) && (
                      <div className="p-4 bg-orange-50/45 rounded-xl border border-orange-100/50 space-y-2">
                        <label className="block text-xs font-bold text-orange-800 uppercase tracking-wider">
                          Reason For Price Adjustment (Optional)
                        </label>
                        <select 
                          value={book.adjustment_reason || "None"} 
                          onChange={(e) => {
                            book.adjustment_reason = e.target.value;
                          }}
                          className="w-full border border-gray-250 rounded-xl px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-orange-950 font-semibold"
                        >
                          <option value="None">Select Adjustment Reason</option>
                          <option value="Condition Adjustment">Condition Adjustment (Wear & Tear)</option>
                          <option value="Market Demand">Market Demand / Rarity</option>
                          <option value="Edition Difference">Edition Difference</option>
                          <option value="Other">Other / Platform Discretion</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => onReject(book.id)}
                disabled={isProcessing}
                className="text-red-600 border-red-200 hover:bg-red-50 focus:ring-red-500 font-bold"
              >
                Reject Listing
              </Button>
              <Button 
                variant="outline"
                onClick={() => onApprove(book.id, approvedPrice, book.adjustment_reason || "None", negotiable)}
                disabled={isProcessing}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 focus:ring-blue-500 font-bold bg-white"
              >
                Save Changes
              </Button>
              <Button 
                onClick={() => onApprove(book.id, approvedPrice, book.adjustment_reason || "None", negotiable)}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 focus:ring-green-500 font-bold"
              >
                <CheckCircle size={18} className="mr-2" />
                Approve & Publish
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
