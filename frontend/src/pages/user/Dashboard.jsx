import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Package, 
  Clock, 
  CheckCircle, 
  Heart, 
  ShoppingBag, 
  PlusCircle, 
  User, 
  ArrowRight,
  Bell,
  Trash2,
  Calendar,
  MapPin,
  HelpCircle,
  Search,
  FileText,
  Printer,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { bookService } from "../../services/bookService";
import { wishlistService } from "../../services/wishlistService";
import { orderService } from "../../services/orderService";
import { notificationService } from "../../services/notificationService";
import { printOrderService } from "../../services/printOrderService";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/Button";

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUploaded: 0,
    approved: 0,
    pending: 0,
    sold: 0,
    wishlistCount: 0,
    ordersCount: 0,
  });
  const [uploadsList, setUploadsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [wishlistList, setWishlistList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [printOrdersList, setPrintOrdersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("uploads");

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [uploads, wishlist, orders, notifications, printOrders] = await Promise.allSettled([
        bookService.getMyUploads(),
        wishlistService.getWishlist(),
        orderService.getMyOrders(),
        notificationService.getNotifications(),
        printOrderService.getMyPrintOrders()
      ]);

      const uploadedBooks = uploads.status === "fulfilled" ? uploads.value : [];
      const wishlistBooks = wishlist.status === "fulfilled" ? wishlist.value : [];
      const myOrders = orders.status === "fulfilled" ? orders.value : [];
      const myNotifications = notifications.status === "fulfilled" ? notifications.value : [];
      const myPrintOrders = printOrders.status === "fulfilled" ? printOrders.value : [];

      setUploadsList(uploadedBooks);
      setWishlistList(wishlistBooks);
      setOrdersList(myOrders);
      setNotificationsList(myNotifications);
      setPrintOrdersList(myPrintOrders);

      // Compute book stats
      const totalUploaded = uploadedBooks.length;
      const approved = uploadedBooks.filter(b => b.status?.toLowerCase() === "approved" || b.status?.toLowerCase() === "sold").length;
      const pending = uploadedBooks.filter(b => b.status?.toLowerCase() === "pending").length;
      const sold = uploadedBooks.filter(b => b.status?.toLowerCase() === "sold").length;

      setStats({
        totalUploaded,
        approved,
        pending,
        sold,
        wishlistCount: wishlistBooks.length,
        ordersCount: myOrders.length,
      });

    } catch (error) {
      console.error("Error loading dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRemoveWishlist = async (id) => {
    try {
      await wishlistService.removeFromWishlist(id);
      toast.success("Removed from wishlist");
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="h-44 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        </div>
        <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const floatVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariants}
      className="space-y-8 p-1 md:p-4 text-gray-800 dark:text-gray-100 max-w-7xl mx-auto"
    >
      {/* Top Welcome Card */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-emerald-950 text-white p-8 md:p-10 shadow-xl border border-white/10"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-64 h-64 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
        
        {/* Floating Icons */}
        <motion.div
          variants={floatVariants}
          animate="animate"
          className="absolute right-16 bottom-4 text-white/5 text-9xl pointer-events-none hidden md:block select-none"
        >
          🎓
        </motion.div>
        <motion.div
          variants={{
            animate: {
              y: [0, 8, 0],
              transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }
          }}
          animate="animate"
          className="absolute left-1/3 top-6 text-white/5 text-7xl pointer-events-none hidden md:block select-none"
        >
          📚
        </motion.div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              Welcome back, {user?.name || "Student"} 👋
            </h1>
            <p className="text-base md:text-lg text-white/80 font-medium max-w-lg leading-relaxed">
              Buy, sell, and manage your student essentials in one place
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 self-start md:self-auto shadow-inner">
            <div className="h-10 w-10 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary">
              <User size={22} />
            </div>
            <div>
              <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">Account Role</p>
              <p className="text-sm font-bold text-white capitalize">{user?.role || "Student"}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Services / Features Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>Campus Essentials Services</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Sell Books */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.01, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800 p-8 shadow-lg flex flex-col justify-between hover:shadow-xl hover:border-emerald-500/20 dark:hover:border-emerald-500/20 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center text-emerald-600 text-3xl shrink-0 group-hover:scale-110 transition-transform">📚</div>
                <div className="flex flex-col gap-1.5 items-end">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full uppercase tracking-wider">💰 Save money</span>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full uppercase tracking-wider">🎓 Student verified</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sell Your Books</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium text-sm leading-relaxed">Turn your old books into money. List items securely and trade directly on campus.</p>
            </div>
            <Button
              onClick={() => navigate("/sell-book")}
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-lg active:scale-95"
            >
              <PlusCircle size={18} />
              List Book
            </Button>
          </motion.div>

          {/* Card 2: Xerox & Print Delivery (Beta) */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.01, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800 p-8 shadow-lg flex flex-col justify-between hover:shadow-xl hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl flex items-center justify-center text-indigo-600 text-3xl shrink-0 group-hover:scale-110 transition-transform">📄</div>
                <div className="flex flex-col gap-1.5 items-end">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full uppercase tracking-wider">⚡ Fast</span>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full uppercase tracking-wider">📍 Campus delivery</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Xerox & Print Delivery <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full ml-1">BETA</span></h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium text-sm leading-relaxed">Upload PDF. Relax. Get delivery. Upload notes, lab manuals, and reports for on-campus delivery.</p>
            </div>
            <Button
              onClick={() => navigate("/print-delivery")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-lg active:scale-95"
            >
              Try Print Service
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: My Listings */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("uploads")}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800 p-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats?.totalUploaded || 0}</span>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">My Listings</p>
          </div>
          <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen size={20} />
          </div>
        </motion.div>

        {/* Stat 2: My Orders */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("orders")}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800 p-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats?.ordersCount || 0}</span>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">My Orders</p>
          </div>
          <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShoppingBag size={20} />
          </div>
        </motion.div>

        {/* Stat 3: Wishlist */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("wishlist")}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800 p-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats?.wishlistCount || 0}</span>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Wishlist</p>
          </div>
          <div className="h-10 w-10 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Heart size={20} className="fill-red-500/10 text-red-500" />
          </div>
        </motion.div>

        {/* Stat 4: Notifications */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("notifications")}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800 p-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{notificationsList?.length || 0}</span>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notifications</p>
          </div>
          <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Bell size={20} />
          </div>
        </motion.div>
      </div>

      {/* Activity Overview */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Activity</h2>
          
          {/* Tabs header */}
          <div className="flex overflow-x-auto gap-2 bg-gray-100/80 dark:bg-gray-850 p-1.5 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("uploads")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "uploads"
                  ? "bg-white dark:bg-gray-850 text-primary shadow-sm dark:text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BookOpen size={16} />
              Uploads ({stats?.totalUploaded || 0})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "orders"
                  ? "bg-white dark:bg-gray-850 text-primary shadow-sm dark:text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ShoppingBag size={16} />
              Orders ({stats?.ordersCount || 0})
            </button>
            <button
              onClick={() => setActiveTab("printOrders")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "printOrders"
                  ? "bg-white dark:bg-gray-850 text-primary shadow-sm dark:text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText size={16} />
              Print Orders ({printOrdersList?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "wishlist"
                  ? "bg-white dark:bg-gray-850 text-primary shadow-sm dark:text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Heart size={16} />
              Wishlist ({stats?.wishlistCount || 0})
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "notifications"
                  ? "bg-white dark:bg-gray-850 text-primary shadow-sm dark:text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Bell size={16} />
              Notifications
            </button>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="min-h-[250px] relative">
          <AnimatePresence mode="wait">
            {activeTab === "uploads" && (
              <motion.div
                key="uploads"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {!Array.isArray(uploadsList) || uploadsList.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-950/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center">
                    <span className="text-4xl mb-3 select-none">📚</span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">No uploads yet</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">Clean out your desk and list your pre-loved textbooks or notes for other students.</p>
                    <Link to="/sell-book" className="mt-4 inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:bg-primary/95 transition-all active:scale-95">
                      List your first book
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(uploadsList || []).slice(0, 4).map((book) => (
                      <div key={book.id || book._id} className="flex gap-4 p-4 bg-white/40 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 items-center justify-between">
                        <div className="flex gap-3 items-center min-w-0">
                          <div className="w-12 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-gray-300">
                            {book.front_image ? (
                              <img src={book.front_image} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen size={18} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">{book.title}</h4>
                            <p className="text-xs text-gray-550 dark:text-gray-400 mt-0.5">₹{book.admin_price || book.price}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                          book.status === "approved" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" :
                          book.status === "pending" ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" :
                          "bg-gray-100 dark:bg-gray-800 text-gray-600"
                        }`}>
                          {book.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {Array.isArray(uploadsList) && uploadsList.length > 4 && (
                  <div className="text-right">
                    <Link to="/my-uploads" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 justify-end">
                      View all uploads <ChevronRight size={16} />
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {!Array.isArray(ordersList) || ordersList.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-950/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center">
                    <span className="text-4xl mb-3 select-none">📦</span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">No orders yet</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">Your orders and purchases activity will appear here once placed.</p>
                    <Link to="/" className="mt-4 inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:bg-primary/95 transition-all active:scale-95">
                      Browse Books
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(ordersList || []).slice(0, 4).map((order) => (
                      <div key={order.id || order._id} className="p-4 bg-white/40 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <div className="min-w-0 space-y-1">
                          <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">Order ID: {order._id ? order._id.slice(-8).toUpperCase() : order.id}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(order.created_at || order.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>₹{order.total_amount || order.amount}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                          order.status === "delivered" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" :
                          order.status === "cancelled" ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400" :
                          "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                        }`}>
                          {order.status || "processing"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {Array.isArray(ordersList) && ordersList.length > 4 && (
                  <div className="text-right">
                    <Link to="/my-orders" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 justify-end">
                      View all orders <ChevronRight size={16} />
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "printOrders" && (
              <motion.div
                key="printOrders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {!Array.isArray(printOrdersList) || printOrdersList.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-950/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center">
                    <span className="text-4xl mb-3 select-none">📄</span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">No print orders yet</h3>
                    <p className="text-xs text-gray-550 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">Need assignments, lab reports, or notes printed and delivered? Try Xerox Print service.</p>
                    <Link to="/print-delivery" className="mt-4 inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:bg-indigo-750 transition-all active:scale-95">
                      Order a Print
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(printOrdersList || []).map((order) => (
                      <div key={order.id || order._id} className="p-5 bg-white/40 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between gap-4">
                        <div className="flex justify-between items-start min-w-0">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm">{order.order_id}</h4>
                              <span className="text-xs text-gray-400 truncate max-w-[150px]">({order.pdf_name})</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                              <span>Pages: {order.pages}</span>
                              <span>•</span>
                              <span>Copies: {order.copies}</span>
                              <span>•</span>
                              <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">{order.print_type}</span>
                              {order.binding !== "None" && (
                                <>
                                  <span>•</span>
                                  <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">{order.binding}</span>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-gray-405 mt-1">Required: {order.delivery_details?.required_time || "Not provided"}</p>
                            <p className="text-xs text-gray-405">Payment: {order.payment_method} ({order.payment_status})</p>
                            {order.admin_notes && (
                              <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 rounded-lg text-xs">
                                <strong>Admin Note:</strong> {order.admin_notes}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-extrabold text-gray-900 dark:text-white">₹{order.total_price}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                              order.status === "Delivered" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" :
                              order.status === "Cancelled" ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400" :
                              order.status === "Pending" ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" :
                              "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {order.status === "Pending" && (
                          <button
                            onClick={async () => {
                              try {
                                if (window.confirm("Are you sure you want to cancel this print order?")) {
                                  await printOrderService.cancelPrintOrder(order.id);
                                  toast.success("Print order cancelled successfully!");
                                  fetchDashboardData();
                                }
                              } catch (err) {
                                toast.error("Failed to cancel print order");
                              }
                            }}
                            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "wishlist" && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {!Array.isArray(wishlistList) || wishlistList.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-950/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center">
                    <span className="text-4xl mb-3 select-none">❤️</span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Your wishlist is empty</h3>
                    <p className="text-xs text-gray-550 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">Tap the heart on any book to save it to your wishlist here.</p>
                    <Link to="/" className="mt-4 inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:bg-primary/95 transition-all active:scale-95">
                      Browse Marketplace
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(wishlistList || []).slice(0, 4).map((item) => {
                      const book = item?.book_id || item?.book || item;
                      if (!book) return null;
                      return (
                        <div key={item.id || item._id} className="flex gap-4 p-4 bg-white/40 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 items-center justify-between">
                          <div className="flex gap-3 items-center min-w-0">
                            <div className="w-12 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-gray-300">
                              {book.front_image ? (
                                <img src={book.front_image} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen size={18} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">{book.title}</h4>
                              <p className="text-xs text-gray-550 dark:text-gray-400 mt-0.5">₹{book.admin_price || book.price}</p>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => navigate(`/books/${book._id || book.id}`)}
                              className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all"
                            >
                              Buy
                            </button>
                            <button
                              onClick={() => handleRemoveWishlist(book._id || book.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {Array.isArray(wishlistList) && wishlistList.length > 4 && (
                  <div className="text-right">
                    <Link to="/wishlist" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 justify-end">
                      View all wishlist <ChevronRight size={16} />
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {!Array.isArray(notificationsList) || notificationsList.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-950/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center">
                    <span className="text-4xl mb-3 select-none">🔔</span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">All caught up!</h3>
                    <p className="text-xs text-gray-550 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">You don't have any notifications or activity updates at the moment.</p>
                  </div>
                ) : (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {(notificationsList || []).slice(0, 4).map((act, actIdx) => (
                        <li key={act.id || act._id}>
                          <div className="relative pb-8">
                            {actIdx !== Math.min(4, notificationsList?.length || 0) - 1 ? (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-800" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                  <Clock size={16} />
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{act.title}</p>
                                  <p className="text-xs text-gray-550 mt-1">{act.message}</p>
                                </div>
                                <div className="text-right text-[10px] whitespace-nowrap text-gray-400">
                                  {new Date(act.created_at || act.createdAt || new Date()).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(notificationsList) && notificationsList.length > 4 && (
                  <div className="text-right">
                    <Link to="/notifications" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 justify-end">
                      View all notifications <ChevronRight size={16} />
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
