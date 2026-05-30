import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle, Package } from "lucide-react";
import toast from "react-hot-toast";
import { notificationService } from "../../services/notificationService";

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id, currentReadStatus) => {
    if (currentReadStatus) return;
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center animate-pulse">Loading notifications...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-500">Stay updated on your orders and account activity.</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
            <Bell size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-500 mb-6">You don't have any new notifications right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <motion.div 
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => markAsRead(notif.id, notif.read)}
              className={`p-5 rounded-2xl border-l-4 shadow-sm cursor-pointer transition-all ${notif.read ? 'bg-white border-l-gray-200 border border-gray-100' : 'bg-blue-50 border-l-blue-500 border border-blue-100'}`}
            >
              <div className="flex gap-4">
                <div className={`mt-1 shrink-0 ${notif.read ? 'text-gray-400' : 'text-blue-500'}`}>
                  {notif.title.includes('Order') ? <Package size={24} /> : <CheckCircle size={24} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-bold text-lg ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                    <span className="text-xs text-gray-400">{new Date(notif.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className={`mt-1 text-sm ${notif.read ? 'text-gray-500' : 'text-gray-700'}`}>{notif.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
