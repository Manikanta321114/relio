import { motion } from "framer-motion";
import clsx from "clsx";
import { X } from "lucide-react";

const CATEGORIES = {
  "School Books": [
    "Nursery & KG",
    "Class 1-5",
    "Class 6-8",
    "Class 9-10",
    "Class 11-12 Science",
    "Class 11-12 Commerce",
    "Class 11-12 Arts"
  ],
  "Competitive Exams": [
    "JEE",
    "NEET",
    "KCET",
    "COMEDK",
    "UPSC",
    "SSC",
    "Banking",
    "Railways",
    "GATE",
    "CAT"
  ],
  "Engineering": [
    "Computer Science",
    "Information Science",
    "AI & DS",
    "ECE",
    "Electrical",
    "Mechanical",
    "Civil"
  ],
  "Medical": [],
  "Commerce & Management": [],
  "Programming & Skills": [],
  "General Reading": [],
  "Others": []
};
const CONDITIONS = ["Like New", "Good", "Average", "Old"];

export const FilterSidebar = ({ filters, setFilters, onClose, isMobile }) => {
  const handleCategoryChange = (cat) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === cat ? "" : cat,
      subcategory: ""
    }));
  };

  const handleSubcategoryChange = (sub) => {
    setFilters(prev => ({
      ...prev,
      subcategory: prev.subcategory === sub ? "" : sub
    }));
  };

  const handleConditionChange = (cond) => {
    setFilters(prev => ({
      ...prev,
      condition: prev.condition === cond ? "" : cond
    }));
  };

  const clearFilters = () => {
    setFilters(prev => ({ ...prev, category: "", subcategory: "", condition: "", sort: "newest" }));
  };

  const SidebarContent = (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
        {isMobile && (
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-8 hide-scrollbar">
        {/* Categories */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Category</h4>
          <div className="space-y-3">
            {Object.keys(CATEGORIES).map(cat => {
              const isSelected = filters.category === cat;
              const subcategories = CATEGORIES[cat];
              
              return (
                <div key={cat} className="space-y-2">
                  <label onClick={() => handleCategoryChange(cat)} className="flex items-center space-x-3 cursor-pointer group">
                    <div className={clsx(
                      "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                      isSelected ? "bg-primary border-primary" : "border-gray-300 group-hover:border-primary"
                    )}>
                      {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <span className={clsx("text-sm", isSelected ? "font-semibold text-primary" : "text-gray-600 group-hover:text-gray-900")}>
                      {cat}
                    </span>
                  </label>
                  
                  {isSelected && subcategories && subcategories.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pl-8 pt-1 pb-2 space-y-2 border-l border-gray-100 ml-2.5"
                    >
                      {subcategories.map(sub => {
                        const isSubSelected = filters.subcategory === sub;
                        return (
                          <label key={sub} onClick={() => handleSubcategoryChange(sub)} className="flex items-center space-x-3 cursor-pointer group py-0.5">
                            <div className={clsx(
                              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                              isSubSelected ? "bg-primary border-primary" : "border-gray-300 group-hover:border-primary"
                            )}>
                              {isSubSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-white rounded-sm" />}
                            </div>
                            <span className={clsx("text-xs", isSubSelected ? "font-medium text-primary" : "text-gray-500 group-hover:text-gray-700")}>
                              {sub}
                            </span>
                          </label>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Condition */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Condition</h4>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map(cond => (
              <button
                key={cond}
                onClick={() => handleConditionChange(cond)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  filters.condition === cond 
                    ? "bg-primary text-white border-primary shadow-md" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                )}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Sort (Only on mobile since desktop has it in the header usually, but good to have here too) */}
        {isMobile && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Sort By</h4>
            <select
              value={filters.sort}
              onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
              className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/50 outline-none"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="oldest">Oldest First</option>
              <option value="low_to_high">Price: Low to High</option>
              <option value="high_to_low">Price: High to Low</option>
            </select>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-100 mt-4">
        <button
          onClick={clearFilters}
          className="w-full py-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
        >
          Clear All Filters
        </button>
        {isMobile && (
          <button
            onClick={onClose}
            className="w-full mt-2 py-3 bg-primary text-white font-medium rounded-xl shadow-lg shadow-primary/20"
          >
            Show Results
          </button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="p-5 h-[85vh] bg-white rounded-t-3xl">
        {SidebarContent}
      </div>
    );
  }

  return (
    <div className="w-64 bg-white/50 backdrop-blur-md border border-gray-100 rounded-3xl p-6 h-fit sticky top-24 shadow-sm hidden lg:block">
      {SidebarContent}
    </div>
  );
};
