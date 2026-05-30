import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ArchiveX } from "lucide-react";
import { adminService } from "../../services/adminService";
import { InventoryCard } from "../../components/admin/InventoryCard";
import { AdminEmptyState } from "../../components/admin/AdminEmptyState";
import { AdminSkeleton } from "../../components/admin/AdminSkeleton";
import clsx from "clsx";

const TABS = [
  { id: "all", label: "All Active" },
  { id: "collected", label: "Collected" },
  { id: "packed", label: "Packed" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" }
];

export const AdminInventory = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getOrders();
      // Only keep orders that are in the logistics pipeline
      const validStatuses = ["collected", "packed", "shipped", "delivered"];
      setOrders(data.filter(o => validStatuses.includes(o.status)));
    } catch (error) {
      toast.error("Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInventory = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter(o => o.status === activeTab);
  }, [orders, activeTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Logistics & Inventory</h1>
        <p className="text-gray-500 mt-2">Track the physical location and state of books in transit.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminSkeleton count={6} type="card" />
        </div>
      ) : filteredInventory.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredInventory.map((order) => (
              <InventoryCard key={order.id} order={order} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <AdminEmptyState
          icon={ArchiveX}
          title={`No ${activeTab === 'all' ? 'active' : activeTab} inventory`}
          description="There are currently no physical books tracked in this logistic stage."
        />
      )}
    </div>
  );
};
