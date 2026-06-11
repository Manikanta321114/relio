import { useState, useEffect } from "react";
import { 
  FileText, 
  Printer, 
  Download, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle,
  Truck,
  MessageSquare,
  Search,
  Filter,
  School
} from "lucide-react";
import { printOrderService } from "../../services/printOrderService";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import toast from "react-hot-toast";

export const AdminPrintOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Admin notes state mapped by order ID
  const [adminNotes, setAdminNotes] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await printOrderService.getAllPrintOrders();
      const safeData = Array.isArray(data) ? data : [];
      setOrders(safeData);
    } catch (err) {
      console.error("AdminPrintOrders fetch error:", err);
      toast.error("Failed to fetch print orders");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!orderId) return;
    const note = adminNotes[orderId] || "";
    try {
      await printOrderService.updatePrintOrderStatus(orderId, newStatus, note);
      toast.success(`Order status updated to ${newStatus}`);
      
      // Clear note field on success
      setAdminNotes(prev => ({ ...prev, [orderId]: "" }));
      
      // Refresh list
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const safeOrdersList = Array.isArray(orders) ? orders : [];

  const filteredOrders = safeOrdersList.filter(order => {
    const orderId = order?.order_id || "";
    const studentName = order?.delivery_details?.student_name || "";
    const phone = String(order?.delivery_details?.phone_number || order?.delivery_details?.phone || "");
    const pdfName = order?.pdf_name || "";

    const matchesSearch = 
      orderId.toLowerCase().includes(search.toLowerCase()) ||
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      phone.includes(search) ||
      pdfName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || (order?.status || "Pending") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 text-gray-800 dark:text-gray-100">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Printer className="text-primary" /> Print Orders (Beta)
        </h1>
        <p className="text-gray-500 mt-2">Manage student print jobs, check delivery locations, and update processing states.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Student name, Phone or PDF name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={18} className="text-gray-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-850 text-sm outline-none bg-white dark:bg-gray-900"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Printing">Printing</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
          <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-10 text-center text-gray-500">
          <p className="font-semibold">No print orders found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.map((order, index) => {
            const orderIdVal = order?.id || order?._id || `temp-${index}`;
            const statusVal = order?.status || "Pending";
            
            return (
              <Card key={orderIdVal} className="p-6 md:p-8 bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Order Info Column */}
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-bold text-gray-905 dark:text-white">{order?.order_id || "N/A"}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      statusVal === "Delivered" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" :
                      statusVal === "Cancelled" ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400" :
                      statusVal === "Pending" ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" :
                      "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                    }`}>
                      {statusVal}
                    </span>
                    <span className="text-xs text-gray-400">
                      Placed: {order?.created_at ? new Date(order.created_at).toLocaleString() : "N/A"}
                    </span>
                  </div>

                  {/* Document & Options */}
                  <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-150 dark:border-gray-800 space-y-2.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={18} className="text-red-500 shrink-0" />
                        <span className="font-bold text-sm truncate text-gray-900 dark:text-white">{order?.pdf_name || "document.pdf"}</span>
                        <span className="text-xs text-gray-400 shrink-0">({order?.pages || 0} pages)</span>
                      </div>
                      {order?.pdf_url && (
                        <a
                          href={order.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
                        >
                          <Download size={14} /> Download PDF
                        </a>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 border-t pt-2 border-gray-200/50 dark:border-gray-800">
                      <span>Copies: <strong className="text-gray-750 dark:text-gray-200">{order?.copies || 0}</strong></span>
                      <span>•</span>
                      <span>Color Mode: <strong className="text-indigo-600 dark:text-indigo-400">{order?.print_type || "B/W"}</strong></span>
                      <span>•</span>
                      <span>Binding: <strong className="text-purple-600 dark:text-purple-400">{order?.binding || "None"}</strong></span>
                    </div>
                  </div>

                  {/* Delivery and Contacts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                        <User size={15} className="text-gray-400" />
                        {order?.delivery_details?.student_name || "Not provided"}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Phone size={14} className="text-gray-400" />
                        {order?.delivery_details?.phone_number || order?.delivery_details?.phone || "Not provided"}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <School size={14} className="text-gray-400" />
                        {order?.delivery_details?.college_name || "Not provided"}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2 text-xs">
                        <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white">{order?.delivery_details?.delivery_location || "Delivery"} Address:</span>
                          <p className="text-gray-500 mt-0.5">{order?.delivery_details?.address || "Not provided"}</p>
                          {order?.delivery_details?.landmark && (
                            <p className="text-gray-400 text-[11px]">Landmark: {order?.delivery_details?.landmark}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                        <Calendar size={14} />
                        Required Time: {order?.delivery_details?.required_time || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Column */}
                <div className="lg:w-80 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 pt-6 lg:pt-0 lg:pl-6 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Pricing / Payments</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">₹{order?.total_price || 0}</span>
                      <p className="text-[10px] text-gray-450 uppercase font-semibold">{order?.payment_method || "COD"} • {order?.payment_status || "Pending"}</p>
                    </div>
                  </div>

                  {/* Custom Admin Note Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MessageSquare size={13} /> Add Delivery Note / Message
                    </label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Your copies will be delivered by 5PM"
                      value={adminNotes[orderIdVal] || ""}
                      onChange={(e) => setAdminNotes({ ...adminNotes, [orderIdVal]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-transparent text-xs outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>

                  {/* Status Update Actions */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Update Processing Status</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {statusVal !== "Cancelled" && statusVal !== "Delivered" && (
                        <>
                          {statusVal === "Pending" && (
                            <button
                              onClick={() => handleStatusUpdate(orderIdVal, "Accepted")}
                              className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-600 hover:text-white dark:text-indigo-400 dark:hover:text-white text-xs font-bold rounded-xl transition-all border border-indigo-500/20"
                            >
                              Accept Order
                            </button>
                          )}
                          {statusVal === "Accepted" && (
                            <button
                              onClick={() => handleStatusUpdate(orderIdVal, "Printing")}
                              className="w-full py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white dark:text-blue-400 dark:hover:text-white text-xs font-bold rounded-xl transition-all border border-blue-500/20"
                            >
                              Start Printing
                            </button>
                          )}
                          {statusVal === "Printing" && (
                            <button
                              onClick={() => handleStatusUpdate(orderIdVal, "Out for Delivery")}
                              className="w-full py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white dark:text-amber-400 dark:hover:text-white text-xs font-bold rounded-xl transition-all border border-amber-500/20"
                            >
                              Ship Out
                            </button>
                          )}
                          {statusVal === "Out for Delivery" && (
                            <button
                              onClick={() => handleStatusUpdate(orderIdVal, "Delivered")}
                              className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white dark:text-emerald-400 dark:hover:text-white text-xs font-bold rounded-xl transition-all border border-emerald-500/20 col-span-2"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </>
                      )}
                      
                      {/* Allow cancel if Pending or Accepted */}
                      {(statusVal === "Pending" || statusVal === "Accepted") && (
                        <button
                          onClick={() => {
                            if (window.confirm("Reject/Cancel this order?")) {
                              handleStatusUpdate(orderIdVal, "Cancelled");
                            }
                          }}
                          className="w-full py-2 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white dark:text-red-400 dark:hover:text-white text-xs font-bold rounded-xl transition-all border border-red-500/20"
                        >
                          Cancel Job
                        </button>
                      )}
                    </div>
                  </div>

                </div>

              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
