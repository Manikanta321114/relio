import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { adminService } from "../../services/adminService";
import { BookOpen, CheckCircle, Package, Users } from "lucide-react";
import { Card } from "../../components/ui/Card";

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pendingBooks: 0,
    approvedBooks: 0,
    activeOrders: 0,
    totalUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: "Pending Approvals", value: stats.pendingBooks, icon: BookOpen, color: "text-amber-500", bg: "bg-amber-50" },
    { title: "Approved Books", value: stats.approvedBooks, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
    { title: "Active Orders", value: stats.activeOrders, icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-purple-500", bg: "bg-purple-50" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 mt-2">Monitor marketplace activity and operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 relative overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <h3 className="text-gray-500 font-medium">{stat.title}</h3>
              {isLoading ? (
                <div className="h-10 w-24 bg-gray-100 animate-pulse rounded mt-2" />
              ) : (
                <div className="text-4xl font-bold text-gray-900 mt-2">{stat.value}</div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Chart Placeholder for future */}
      <Card className="p-8 mt-8 border border-gray-100 border-dashed bg-gray-50/50 flex flex-col items-center justify-center min-h-[300px]">
        <BarChart3 size={48} className="text-gray-300 mb-4" />
        <h3 className="text-gray-500 font-medium">Analytics coming soon</h3>
      </Card>
    </div>
  );
};
import { BarChart3 } from "lucide-react";
