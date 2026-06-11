import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { bookService } from "../../services/bookService";
import { ListingCard } from "../../components/dashboard/ListingCard";
import { EmptyUploadsState } from "../../components/dashboard/EmptyUploadsState";
import toast from "react-hot-toast";
import clsx from "clsx";

export const MyUploads = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected, sold

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const data = await bookService.getMyUploads();
      setBooks(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your uploads");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (book) => {
    navigate(`/sell-book?edit=${book.id || book._id}`);
  };

  const handleDelete = async (bookId) => {
    try {
      await bookService.deleteBook(bookId);
      toast.success("Listing deleted successfully!");
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete book");
    }
  };

  const filteredBooks = books.filter(book => filter === "all" || book.status === filter);

  const filters = [
    { id: "all", label: "All Uploads" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "sold", label: "Sold" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Uploads</h1>
        <p className="text-gray-500 mt-2">Manage your listings and track their approval status.</p>
      </div>

      {/* Filter Tabs */}
      {!isLoading && books.length > 0 && (
        <div className="flex overflow-x-auto hide-scrollbar space-x-2 mb-8 pb-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={clsx(
                "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                filter === f.id
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-40 bg-white border border-gray-100 rounded-2xl animate-pulse p-4 flex gap-4">
                <div className="w-32 h-full bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-6 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="mt-auto h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <EmptyUploadsState />
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence>
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book, index) => (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ListingCard book={book} onEdit={handleEdit} onDelete={handleDelete} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-gray-500"
                >
                  No books found for this filter.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};
