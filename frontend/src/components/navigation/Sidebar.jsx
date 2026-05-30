import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, ShoppingBag, PlusCircle, BookOpen, Bell, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
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

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="hidden md:flex flex-col h-screen sticky top-0 bg-white/80 backdrop-blur-xl border-r border-gray-200 shadow-sm z-40 transition-all duration-300"
    >
      <div className="flex items-center justify-between p-6 h-20">
        {!isCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
            <span className="text-2xl font-bold text-primary tracking-tight">RELIO</span>
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={clsx(
            "p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.name} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                  "flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                )}
              >
                <Icon size={22} className={clsx("min-w-[22px]", isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
                {!isCollapsed && (
                  <span className="ml-3 font-medium whitespace-nowrap">{item.name}</span>
                )}
                {/* Active Indicator Line */}
                {isActive && isCollapsed && (
                  <motion.div layoutId="active-indicator" className="absolute left-0 w-1 h-8 bg-white rounded-r-full" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mb-4">
        <button
          onClick={logout}
          className={clsx(
            "flex items-center w-full px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors group",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut size={22} className="min-w-[22px] text-red-400 group-hover:text-red-500" />
          {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};
