import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { BookOpen } from "lucide-react";
import { adminService } from "../../services/adminService";
import { ApprovalCard } from "../../components/admin/ApprovalCard";
import { ReviewModal } from "../../components/admin/ReviewModal";
import { AdminEmptyState } from "../../components/admin/AdminEmptyState";
import { AdminSkeleton } from "../../components/admin/AdminSkeleton";

export const AdminApprovals = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPendingBooks();
  }, []);

  const fetchPendingBooks = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getPendingBooks();
      setBooks(data);
    } catch (error) {
      toast.error("Failed to load pending books");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id, adminPrice = null, adjustmentReason = "None", negotiable = false) => {
    try {
      setIsProcessing(true);
      const priceToApprove = adminPrice !== null ? adminPrice : books.find(b => b.id === id)?.price;
      await adminService.approveBook(id, priceToApprove, adjustmentReason, negotiable);
      setBooks(prev => prev.filter(b => b.id !== id));
      toast.success("Book approved successfully!");
      if (selectedBook?.id === id) setSelectedBook(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to approve book");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this listing?")) return;
    
    try {
      setIsProcessing(true);
      await adminService.rejectBook(id);
      setBooks(prev => prev.filter(b => b.id !== id));
      toast.success("Book rejected.");
      if (selectedBook?.id === id) setSelectedBook(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to reject book");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pending Approvals</h1>
        <p className="text-gray-500 mt-2">Review new book listings before they go live on the marketplace.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AdminSkeleton count={4} type="card" />
        </div>
      ) : books.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {books.map((book) => (
              <ApprovalCard
                key={book.id}
                book={book}
                onApprove={handleApprove}
                onReject={handleReject}
                onViewDetails={setSelectedBook}
                isProcessing={isProcessing}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <AdminEmptyState
          icon={BookOpen}
          title="No pending approvals"
          description="All caught up! New listings will appear here when sellers upload them."
        />
      )}

      <ReviewModal
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        book={selectedBook}
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={isProcessing}
      />
    </div>
  );
};
