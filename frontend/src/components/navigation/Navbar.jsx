import { Bell, Menu, User, Package, CheckCircle, Heart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const Navbar = ({ toggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // refresh every 15s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { notificationService } = await import("../../services/notificationService");
      const data = await notificationService.getNotifications();
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
      setRecentNotifs(data.slice(0, 3));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 md:px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="flex items-center flex-1">
        <button onClick={toggleMobileMenu} className="md:hidden p-2 mr-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Wishlist Badge */}
        {user && (
          <Link 
            to="/wishlist" 
            className="flex items-center space-x-1.5 p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors relative"
            title="My Wishlist"
          >
            <Heart size={20} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} />
            <span className="hidden sm:inline text-sm font-semibold text-gray-700 hover:text-red-500 transition-colors">
              Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : "(0)"}
            </span>
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 sm:hidden items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {wishlistCount}
              </span>
            )}
          </Link>
        )}

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            onBlur={() => setTimeout(() => setShowNotifMenu(false), 200)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          
          <AnimatePresence>
            {showNotifMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{unreadCount} New</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {recentNotifs.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">No new notifications</div>
                  ) : (
                    recentNotifs.map((notif) => (
                      <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer flex gap-3">
                        <div className="mt-0.5 text-blue-500 shrink-0">
                          {notif.title.includes("Order") ? <Package size={16} /> : <CheckCircle size={16} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link to="/notifications" className="block p-3 text-center text-sm font-medium text-primary hover:bg-primary/5 transition-colors border-t border-gray-100">
                  View all notifications
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            onBlur={() => setTimeout(() => setShowProfileMenu(false), 200)}
            className="flex items-center space-x-2 p-1 pr-2 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || <User size={16} />}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name?.split(' ')[0] || 'Profile'}</span>
          </button>
          
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Account Settings</Link>
                  {user?.role === "admin" && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-primary hover:bg-primary/5">Admin Panel</Link>
                  )}
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
