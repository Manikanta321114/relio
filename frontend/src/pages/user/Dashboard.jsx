import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Package, 
  Clock, 
  CheckCircle, 
  Heart, 
  ShoppingBag, 
  DollarSign, 
  PlusCircle, 
  Settings, 
  User, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { bookService } from "../../services/bookService";
import { wishlistService } from "../../services/wishlistService";
import { orderService } from "../../services/orderService";
import { notificationService } from "../../services/notificationService";
import { Link } from "react-router-dom";

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUploaded: 0,
    approved: 0,
    pending: 0,
    sold: 0,
    wishlistCount: 0,
    ordersCount: 0,
  });
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch everything concurrently
        const [uploads, wishlist, orders, notifications] = await Promise.allSettled([
          bookService.getMyUploads(),
          wishlistService.getWishlist(),
          orderService.getMyOrders(),
          notificationService.getNotifications()
        ]);

        const uploadedBooks = uploads.status === "fulfilled" ? uploads.value : [];
        const wishlistBooks = wishlist.status === "fulfilled" ? wishlist.value : [];
        const myOrders = orders.status === "fulfilled" ? orders.value : [];
        const myNotifications = notifications.status === "fulfilled" ? notifications.value : [];

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

        // Construct a recent activity timeline
        const recentNotifs = myNotifications.slice(0, 5).map(n => ({
          id: n.id || n._id,
          title: n.title,
          message: n.message,
          time: n.created_at || new Date().toISOString(),
        }));

        setActivities(recentNotifs);

      } catch (error) {
        console.error("Error loading dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Welcome Card Skeleton */}
        <div className="h-64 bg-gray-200 rounded-3xl" />
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>

        {/* Timeline Skeleton */}
        <div className="h-80 bg-gray-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Profile Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-indigo-700 text-white p-8 md:p-12 shadow-xl border border-primary/20"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary opacity-25 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <User className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Welcome, {user?.name || "Reader"}!
                </h1>
                <p className="text-sm text-white/70 font-medium">
                  {user?.email}
                </p>
              </div>
            </div>
            <p className="text-base md:text-lg text-white/80 leading-relaxed font-medium">
              Manage your orders, book uploads, active listings, and wishlist. Relio is a marketplace to buy and sell used books easily.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/sell-book"
              className="flex items-center justify-center gap-2 bg-secondary text-primary font-semibold px-6 py-3.5 rounded-xl hover:bg-white hover:text-primary transition-all duration-200 shadow-lg shadow-secondary/20 whitespace-nowrap"
            >
              <PlusCircle size={18} />
              Sell a Book
            </Link>
            <Link 
              to="/"
              className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 whitespace-nowrap"
            >
              Browse Marketplace
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Account Statistics Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="text-primary" size={22} />
          Account Dashboard Summary
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {/* Total Uploaded */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">Total Uploaded</span>
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><BookOpen size={20} /></span>
            </div>
            <span className="text-2xl font-bold text-gray-900 mt-4">{stats.totalUploaded}</span>
          </div>

          {/* Approved Books */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">Approved</span>
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={20} /></span>
            </div>
            <span className="text-2xl font-bold text-gray-900 mt-4">{stats.approved}</span>
          </div>

          {/* Pending Approval */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">Pending</span>
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Clock size={20} /></span>
            </div>
            <span className="text-2xl font-bold text-gray-900 mt-4">{stats.pending}</span>
          </div>

          {/* Wishlist Count */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">Wishlist</span>
              <span className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Heart size={20} /></span>
            </div>
            <span className="text-2xl font-bold text-gray-900 mt-4">{stats.wishlistCount}</span>
          </div>

          {/* My Orders Count */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">My Orders</span>
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl"><ShoppingBag size={20} /></span>
            </div>
            <span className="text-2xl font-bold text-gray-900 mt-4">{stats.ordersCount}</span>
          </div>

          {/* Sold Books Count - only shown if > 0 or always included as computed */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">Sold Books</span>
              <span className="p-2 bg-cyan-50 text-cyan-600 rounded-xl"><DollarSign size={20} /></span>
            </div>
            <span className="text-2xl font-bold text-gray-900 mt-4">{stats.sold}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity Timeline</h2>
        
        {activities.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center justify-center">
            <div className="p-4 bg-gray-50 rounded-full text-gray-400 mb-4">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">No Recent Activity</h3>
            <p className="text-gray-500 text-sm max-w-sm mt-1">
              Any notifications or status updates on your orders and uploads will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((act, actIdx) => (
                <li key={act.id}>
                  <div className="relative pb-8">
                    {actIdx !== activities.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <Clock size={16} />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{act.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{act.message}</p>
                        </div>
                        <div className="text-right text-xs whitespace-nowrap text-gray-400">
                          {new Date(act.time).toLocaleDateString(undefined, {
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
      </div>
    </div>
  );
};
