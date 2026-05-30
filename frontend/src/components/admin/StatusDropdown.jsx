import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import clsx from "clsx";

const STATUS_CONFIG = {
  interested: { label: "Interested", color: "bg-gray-100 text-gray-700" },
  seller_contacted: { label: "Seller Contacted", color: "bg-blue-100 text-blue-700" },
  collected: { label: "Collected", color: "bg-purple-100 text-purple-700" },
  packed: { label: "Packed", color: "bg-indigo-100 text-indigo-700" },
  shipped: { label: "Shipped", color: "bg-amber-100 text-amber-700" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

export const StatusDropdown = ({ status, onStatusChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentConfig = STATUS_CONFIG[status] || STATUS_CONFIG.interested;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <motion.button
        whileTap={disabled ? {} : { scale: 0.97 }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          "inline-flex items-center justify-between w-40 px-3 py-1.5 text-sm font-medium rounded-full border transition-colors focus:outline-none",
          currentConfig.color,
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-80 border-transparent",
          isOpen ? "ring-2 ring-primary/20" : ""
        )}
      >
        <span>{currentConfig.label}</span>
        <ChevronDown size={14} className={clsx("ml-2 transition-transform", isOpen && "rotate-180")} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="absolute z-50 mt-2 w-48 rounded-xl bg-white shadow-lg border border-gray-100 py-1 right-0 lg:left-0 origin-top-right lg:origin-top-left"
          >
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => {
                  onStatusChange(key);
                  setIsOpen(false);
                }}
                className={clsx(
                  "w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors",
                  status === key ? "text-primary font-medium" : "text-gray-700"
                )}
              >
                <span>{config.label}</span>
                {status === key && <Check size={14} className="text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
