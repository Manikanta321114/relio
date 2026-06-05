import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Clock, Tag, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";

export const ReviewModal = ({ isOpen, onClose, book, onApprove, onReject, isProcessing }) => {
  const [approvedPrice, setApprovedPrice] = useState(0);
  const [negotiable, setNegotiable] = useState(false);
  const [adminMessage, setAdminMessage] = useState("Your book has been approved and listed.");
  const [adjustmentReason, setAdjustmentReason] = useState("None");
  
  // Rejection state
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("Images are not clear");
  const [customRejectionDetails, setCustomRejectionDetails] = useState("");

  useEffect(() => {
    if (book) {
      setApprovedPrice(book.price);
      setNegotiable(book.negotiable || false);
      setAdminMessage(`Your book "${book.title}" has been approved and listed.`);
      setAdjustmentReason("None");
      setShowRejectionForm(false);
      setRejectionReason("Images are not clear");
      setCustomRejectionDetails("");
    }
  }, [book]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!book) return null;

  const handleConfirmReject = () => {
    const finalReason = rejectionReason === "Other" 
      ? (customRejectionDetails || "Other unspecified reason") 
      : rejectionReason;
    onReject(book.id, finalReason);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-y-auto flex flex-col max-h-[90vh] border border-gray-100 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle size={20} className="text-primary" />
                  Amazon-Style Seller Verification Panel
                </h2>
                <p className="text-xs text-gray-500 mt-1">Review listing specifications, pricing, and approve or reject submissions.</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              {showRejectionForm ? (
                /* Rejection Form Box */
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50/50 border border-red-200 rounded-2xl p-6 space-y-6"
                >
                  <div className="flex items-center gap-3 text-red-800">
                    <AlertTriangle size={24} />
                    <div>
                      <h3 className="text-lg font-bold">Reject Book Submission</h3>
                      <p className="text-xs text-red-600 mt-0.5">Please specify the exact reason for rejecting this listing. The seller will be notified.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
                        Rejection Reason Category *
                      </label>
                      <select 
                        value={rejectionReason} 
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full border border-red-200 rounded-xl px-4 py-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 text-gray-900 font-semibold"
                      >
                        <option value="Images are not clear">Images are not clear</option>
                        <option value="Book condition is not acceptable">Book condition is not acceptable</option>
                        <option value="Wrong book details">Wrong book details</option>
                        <option value="Other">Other (Custom Reason)</option>
                      </select>
                    </div>

                    {rejectionReason === "Other" && (
                      <div>
                        <label className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
                          Custom Rejection Details *
                        </label>
                        <textarea
                          rows={3}
                          value={customRejectionDetails}
                          onChange={(e) => setCustomRejectionDetails(e.target.value)}
                          className="w-full border border-red-200 rounded-xl px-4 py-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 text-gray-900 shadow-inner"
                          placeholder="Please explain the details of the rejection..."
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => setShowRejectionForm(false)}
                      className="border-gray-200 text-gray-700 hover:bg-gray-100"
                    >
                      Back to Review
                    </Button>
                    <Button 
                      onClick={handleConfirmReject}
                      disabled={isProcessing}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      Confirm Rejection
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Images & Upload Metadata */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Uploaded Book Cover Images</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 text-center">Front Cover</span>
                          <div className="aspect-[3/4] rounded-2xl bg-gray-50 overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center relative group">
                            {book.front_image ? (
                              <img src={book.front_image} alt="Front Cover" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-gray-400">No Image</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 text-center">Back Cover</span>
                          <div className="aspect-[3/4] rounded-2xl bg-gray-50 overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center relative">
                            {book.back_image ? (
                              <img src={book.back_image} alt="Back Cover" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-gray-400 italic">No Back Cover Image</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Book Metadata Sheet */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                      <h4 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">Specification Summary</h4>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                        <p className="flex flex-col"><span className="text-xs text-gray-400 uppercase">Title</span> <span className="font-semibold text-gray-900">{book.title}</span></p>
                        <p className="flex flex-col"><span className="text-xs text-gray-400 uppercase">Author</span> <span className="font-semibold text-gray-900">{book.author || "Unknown"}</span></p>
                        <p className="flex flex-col"><span className="text-xs text-gray-400 uppercase">Category</span> <span className="font-semibold text-gray-900">{book.category}{book.subcategory ? ` / ${book.subcategory}` : ""}</span></p>
                        <p className="flex flex-col"><span className="text-xs text-gray-400 uppercase">Condition</span> <span className="font-semibold text-orange-600">{book.condition}</span></p>
                        <p className="flex flex-col"><span className="text-xs text-gray-400 uppercase">Original Price</span> <span className="font-semibold text-gray-900">{book.original_price ? `₹${book.original_price}` : `₹${(book.price * 1.3).toFixed(0)}`}</span></p>
                        <p className="flex flex-col"><span className="text-xs text-gray-400 uppercase">Seller Expected</span> <span className="font-bold text-primary">₹{book.price}</span></p>
                        {book.year_of_publication && (
                          <p className="flex flex-col"><span className="text-xs text-gray-400 uppercase">Publication Year</span> <span className="font-semibold text-gray-900">{book.year_of_publication}</span></p>
                        )}
                        <p className="flex flex-col col-span-2"><span className="text-xs text-gray-400 uppercase">Upload Date</span> <span className="font-semibold text-gray-900">{new Date(book.created_at).toLocaleString()}</span></p>
                      </div>
                    </div>

                    {/* Seller Profile Verification Details */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3 text-sm">
                      <h4 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">Seller Account & Pickup Location</h4>
                      <p className="flex justify-between"><span className="text-gray-500">Seller Name:</span> <span className="font-bold text-gray-800">{book.seller_name || "Unknown"}</span></p>
                      <p className="flex justify-between"><span className="text-gray-500">Phone Contact:</span> <span className="font-bold text-blue-600">{book.seller_phone || "N/A"}</span></p>
                      <p className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-semibold text-gray-700">{book.seller_email || "N/A"}</span></p>
                      <div>
                        <span className="text-gray-500 block mb-1">Registered Pickup Address:</span>
                        <span className="text-gray-600 block text-xs bg-white p-3 rounded-xl border border-gray-150 leading-relaxed font-semibold">{book.seller_pickup_address || "Not Available"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Listing Customization & Approval Panel */}
                  <div className="space-y-6">
                    <div className="border border-gray-100 rounded-2xl p-6 bg-white space-y-6">
                      <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Administrative Decision Parameters</h3>
                      
                      {/* Price Customization */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                          <Tag size={14} className="text-primary" /> Final Selling Price (₹) *
                        </label>
                        <input 
                          type="number" 
                          value={approvedPrice} 
                          onChange={(e) => setApprovedPrice(parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-xl font-bold text-primary bg-gray-50 shadow-inner" 
                          placeholder="e.g. 150"
                          min="1"
                        />
                        <p className="text-[10px] text-gray-400">Final price visible to all buyers in the marketplace.</p>
                      </div>

                      {/* Admin Message */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Admin Message to Seller *
                        </label>
                        <textarea
                          rows={3}
                          value={adminMessage}
                          onChange={(e) => setAdminMessage(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-gray-700 bg-white"
                          placeholder="Your book has been approved and listed."
                        />
                        <p className="text-[10px] text-gray-400">This message will appear in the seller's dashboard notification center.</p>
                      </div>

                      {/* Description Panel */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Original Seller Comments</h4>
                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                          "{book.description || "No custom remarks from seller."}"
                        </p>
                      </div>

                      {/* Negotiation Switch */}
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 flex items-center justify-between">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Negotiation Status Badge
                          </label>
                          <p className="text-[10px] text-gray-400 mt-0.5">Allow buyers to bargain or negotiate this listing.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={negotiable}
                            onChange={(e) => setNegotiable(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          <span className="ml-3 text-xs font-bold text-gray-700">{negotiable ? "Active" : "Disabled"}</span>
                        </label>
                      </div>

                      {/* Price Adjustment Reason */}
                      {parseFloat(approvedPrice) !== parseFloat(book.price) && (
                        <div className="p-4 bg-orange-50/40 rounded-xl border border-orange-100 space-y-2">
                          <label className="block text-xs font-bold text-orange-800 uppercase tracking-wider">
                            Adjustment Justification Notes
                          </label>
                          <select 
                            value={adjustmentReason} 
                            onChange={(e) => setAdjustmentReason(e.target.value)}
                            className="w-full border border-orange-200 rounded-xl px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-orange-950 font-semibold"
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
              )}
            </div>

            {/* Action Footer */}
            {!showRejectionForm && (
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRejectionForm(true)}
                  disabled={isProcessing}
                  className="text-red-600 border-red-200 hover:bg-red-50 focus:ring-red-500 font-bold bg-white"
                >
                  <XCircle size={18} className="mr-2" />
                  Reject Listing
                </Button>
                <Button 
                  onClick={() => onApprove(book.id, approvedPrice, adjustmentReason, negotiable, adminMessage)}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 focus:ring-green-500 font-bold text-white px-6"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Approve & Publish
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
