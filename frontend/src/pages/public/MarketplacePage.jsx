import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterSidebar } from "../../components/filters/FilterSidebar";
import { MarketplaceBookCard } from "../../components/marketplace/MarketplaceBookCard";
import { EmptyMarketplaceState } from "../../components/marketplace/EmptyMarketplaceState";
import { SkeletonBookCard } from "../../components/skeletons/SkeletonBookCard";
import { marketplaceService } from "../../services/marketplaceService";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

export const MarketplacePage = () => {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    subcategory: "",
    condition: "",
    sort: "newest",
    page: 1,
    limit: 12
  });

  // Debounced search trigger
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== searchInput) {
        setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search]);

  // Fetch data when filters change
  useEffect(() => {
    fetchBooks();
  }, [filters.category, filters.subcategory, filters.condition, filters.sort, filters.page, filters.search]);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const data = await marketplaceService.getBooks(filters);
      setBooks(data.books);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch books", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="max-w-7xl mx-auto py-4 md:py-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-500 mt-1">Discover pre-loved books at great prices.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
              placeholder="Search books by title, author, category..."
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile/Tablet Filter Toggle */}
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden p-3 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 shadow-sm shrink-0"
            >
              <SlidersHorizontal size={20} />
            </button>
            
            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value, page: 1 }))}
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-3 pl-4 pr-10 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium cursor-pointer w-full"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="low_to_high">Price: Low to High</option>
                <option value="high_to_low">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Category Quick Filters */}
      <div className="mb-8 flex overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:pb-0 sm:flex-wrap gap-2.5 md:gap-3 scrollbar-thin scrollbar-thumb-gray-200">
        <button
          onClick={() => setFilters(prev => ({ ...prev, category: "", subcategory: "", page: 1 }))}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shadow-sm border ${
            filters.category === ""
              ? "bg-primary text-white border-primary"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          All Books
        </button>
        {["School Books", "Competitive Exams", "Engineering", "Medical", "Commerce & Management", "Programming & Skills", "General Reading", "Others"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilters(prev => ({ ...prev, category: cat, subcategory: "", page: 1 }))}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shadow-sm border ${
              filters.category.toLowerCase() === cat.toLowerCase()
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative">
        {/* Desktop Sidebar */}
        <FilterSidebar filters={filters} setFilters={(newFilters) => setFilters(prev => ({...prev, ...newFilters(prev), page: 1}))} />
        
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsMobileFiltersOpen(false)}
              />
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative z-10 w-full"
              >
                <FilterSidebar 
                  filters={filters} 
                  setFilters={(newFilters) => setFilters(prev => ({...prev, ...newFilters(prev), page: 1}))}
                  isMobile 
                  onClose={() => setIsMobileFiltersOpen(false)} 
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Grid Area */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonBookCard key={i} />)}
            </div>
          ) : books.length === 0 ? (
            <EmptyMarketplaceState onReset={() => setFilters({ search: "", category: "", subcategory: "", condition: "", sort: "newest", page: 1, limit: 12 })} />
          ) : (
            <>
              <motion.div 
                layout 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {books.map(book => (
                    <MarketplaceBookCard key={book.id} book={book} />
                  ))}
                </AnimatePresence>
              </motion.div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-12 mb-8">
                  <button
                    disabled={filters.page === 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="p-2 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-primary hover:border-primary disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-medium text-gray-600">
                    Page {filters.page} of {totalPages}
                  </span>
                  <button
                    disabled={filters.page === totalPages}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="p-2 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-primary hover:border-primary disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
