import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, PlusCircle, BookOpen, Bell, Settings, LogOut, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import clsx from "clsx";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Marketplace", path: "/marketplace", icon: ShoppingBag },
  { name: "Sell Book", path: "/sell-book", icon: PlusCircle },
  { name: "My Uploads", path: "/my-uploads", icon: BookOpen },
  { name: "My Orders", path: "/my-orders", icon: ShoppingBag },
  { name: "Notifications", path: "/notifications", icon: Bell },
  { name: "Settings", path: "/settings", icon: Settings },
];

export const MobileDrawer = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
      />

      {/* Drawer Content */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative flex flex-col w-full max-w-xs h-full bg-white shadow-2xl z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <span className="text-2xl font-bold text-primary tracking-tight">RELIO</span>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.name} to={item.path} onClick={onClose}>
                <div
                  className={clsx(
                    "flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group active:scale-[0.98]",
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                  )}
                >
                  <Icon
                    size={22}
                    className={clsx(
                      "min-w-[22px]",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-primary"
                    )}
                  />
                  <span className="ml-3 font-semibold text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer (Logout) */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center w-full px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors group active:scale-[0.98]"
          >
            <LogOut size={22} className="min-w-[22px] text-red-400 group-hover:text-red-500" />
            <span className="ml-3 font-semibold text-sm">Logout</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
