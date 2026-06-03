import { useState, useEffect } from "react";
import { Printer, Search, Filter, Phone, MapPin, CheckCircle, Clock, FileText, Download, User, Calendar, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { adminService } from "../../services/adminService";
import { AdminTable } from "../../components/admin/AdminTable";
import { AdminEmptyState } from "../../components/admin/AdminEmptyState";
import { AdminSkeleton } from "../../components/admin/AdminSkeleton";
import { Button } from "../../components/ui/Button";

const STATUSES = ["All", "Pending", "Accepted", "Printing", "Out for Delivery", "Delivered"];

export const AdminPrintOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    fetchPrintOrders();
  }, []);

  const fetchPrintOrders = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getPrintOrders();
      setOrders(data);
    } catch (error) {
      toast.error("Failed to load print orders");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await adminService.updatePrintOrderStatus(id, newStatus);
      toast.success(`Print order status updated to ${newStatus}`);
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
      }
      fetchPrintOrders();
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const handleDownloadPdf = (order) => {
    toast.success(`Downloading PDF: ${order.pdf_file}`);
    // Simulate download
    const link = document.createElement("a");
    link.href = "#";
    link.setAttribute("download", order.pdf_file);
    document.body.appendChild(link);
    // link.click();
    document.body.removeChild(link);
  };

  const getActionButtons = (order) => {
    const s = order.order_status;
    if (s === "Pending") {
      return (
        <Button 
          size="sm" 
          variant="primary" 
          className="bg-green-600 hover:bg-green-700 w-full"
          onClick={() => handleStatusUpdate(order.id, "Accepted")}
        >
          Accept Order
        </Button>
      );
    }
    if (s === "Accepted") {
      return (
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full text-indigo-600 hover:bg-indigo-50 border-indigo-200"
          onClick={() => handleStatusUpdate(order.id, "Printing")}
        >
          Start Printing
        </Button>
      );
    }
    if (s === "Printing") {
      return (
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full text-orange-600 hover:bg-orange-50 border-orange-200"
          onClick={() => handleStatusUpdate(order.id, "Out for Delivery")}
        >
          Dispatch Delivery
        </Button>
      );
    }
    if (s === "Out for Delivery") {
      return (
        <Button 
          size="sm" 
          variant="primary" 
          className="bg-emerald-600 hover:bg-emerald-700 w-full"
          onClick={() => handleStatusUpdate(order.id, "Delivered")}
        >
          Mark Delivered
        </Button>
      );
    }
    return <span className="text-gray-500 font-semibold text-xs capitalize">{s}</span>;
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "All" || order.order_status === statusFilter;
    const matchesSearch = 
      order.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_details?.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_details?.phone?.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const columns = [
    { header: "Order ID", className: "w-1/6" },
    { header: "Student & College", className: "w-2/6" },
    { header: "Document Details", className: "w-2/6" },
    { header: "Price & Actions", className: "w-1/6" }
  ];

  const renderRow = (order) => (
    <>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-bold text-blue-600">{order.order_id}</div>
        <div className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
        <div className={`mt-2 inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          order.order_status === "Delivered" ? "bg-green-100 text-green-700" :
          order.order_status === "Out for Delivery" ? "bg-amber-100 text-amber-700" :
          order.order_status === "Printing" ? "bg-indigo-100 text-indigo-700" :
          order.order_status === "Accepted" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
        }`}>
          {order.order_status}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <div className="font-bold text-gray-900 dark:text-white">{order.delivery_details?.student_name}</div>
          <div className="text-gray-500 text-xs mt-1 flex items-center gap-1"><Phone size={12}/> {order.delivery_details?.phone}</div>
          <div className="text-gray-400 text-xs mt-0.5 flex items-center gap-1"><MapPin size={12}/> {order.delivery_details?.college_name}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 text-red-500 rounded-xl">
            <FileText size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-950 dark:text-white line-clamp-1">{order.pdf_file}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {order.pages} pgs • {order.copies} copies • <span className="uppercase">{order.color_mode}</span> • <span className="capitalize">{order.binding} binding</span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col space-y-2">
          <div className="text-lg font-black text-primary">₹{order.price}</div>
          {getActionButtons(order)}
          <Button 
            size="xs" 
            variant="outline" 
            className="w-full text-xs font-semibold py-1" 
            onClick={() => setSelectedOrder(order)}
          >
            Details
          </Button>
        </div>
      </td>
    </>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Print & Delivery Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage student print uploads, dispatch delivery orders, and monitor print queues.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID, Student Name, or Phone" 
            className="w-full pl-10 pr-4 py-2 border border-gray-250 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative md:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            className="w-full pl-10 pr-4 py-2 border border-gray-250 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s} Statuses</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <AdminSkeleton count={4} type="list" />
      ) : filteredOrders.length > 0 ? (
        <AdminTable columns={columns} data={filteredOrders} renderRow={renderRow} />
      ) : (
        <AdminEmptyState
          icon={Printer}
          title="No print orders found"
          description={searchQuery || statusFilter !== "All" ? "Try adjusting your filters or search query." : "When students upload print jobs, they will appear here."}
        />
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-950 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Print Order Details</h2>
                  <p className="text-xs text-gray-500 mt-1">ID: <span className="font-semibold text-blue-600">{selectedOrder.order_id}</span></p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="p-1.5 hover:bg-gray-250 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Print Details */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b pb-2 border-gray-100 dark:border-gray-850">
                    <Printer size={18} className="text-primary" /> Print Specifications
                  </h3>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Document Name:</span>
                      <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">{selectedOrder.pdf_file}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pages:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{selectedOrder.pages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Copies:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{selectedOrder.copies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Color Mode:</span>
                      <span className="font-semibold text-gray-900 dark:text-white uppercase">{selectedOrder.color_mode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Binding Type:</span>
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">{selectedOrder.binding}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t border-gray-200 dark:border-gray-800 pt-2.5">
                      <span>Total Cost:</span>
                      <span className="text-primary">₹{selectedOrder.price}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPdfModal(true)}
                      className="flex-1 text-xs py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink size={14} /> View Document
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleDownloadPdf(selectedOrder)}
                      className="flex-1 text-xs py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center gap-1.5"
                    >
                      <Download size={14} /> Download PDF
                    </Button>
                  </div>
                </div>

                {/* Right Column: Delivery Details */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b pb-2 border-gray-100 dark:border-gray-850">
                    <Truck size={18} className="text-primary" /> Delivery Destination
                  </h3>

                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl space-y-3 text-sm">
                    <div>
                      <span className="text-xs text-gray-400 block uppercase font-bold">Student Info</span>
                      <p className="font-semibold text-gray-900 dark:text-white mt-1">{selectedOrder.delivery_details?.student_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{selectedOrder.delivery_details?.phone}</p>
                    </div>

                    <div>
                      <span className="text-xs text-gray-400 block uppercase font-bold">College & Delivery Type</span>
                      <p className="font-semibold text-gray-950 dark:text-white mt-1">{selectedOrder.delivery_details?.college_name} ({selectedOrder.delivery_details?.delivery_type})</p>
                    </div>

                    <div>
                      <span className="text-xs text-gray-400 block uppercase font-bold">Full Address</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{selectedOrder.delivery_details?.full_address}</p>
                    </div>

                    {selectedOrder.delivery_details?.landmark && (
                      <div>
                        <span className="text-xs text-gray-400 block uppercase font-bold">Landmark</span>
                        <p className="text-xs text-primary italic mt-0.5">{selectedOrder.delivery_details?.landmark}</p>
                      </div>
                    )}

                    <div className="flex justify-between text-xs pt-1.5 border-t border-gray-200 dark:border-gray-800">
                      <span className="font-semibold text-gray-500">Required By:</span>
                      <span className="font-bold text-primary">{selectedOrder.delivery_details?.required_delivery_time}</span>
                    </div>

                    {selectedOrder.delivery_details?.special_instructions && (
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-xs text-blue-700 dark:text-blue-300 mt-2">
                        <strong>Special Note:</strong> "{selectedOrder.delivery_details?.special_instructions}"
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-semibold">Update Status:</span>
                  <div className="flex gap-1.5">
                    {["Accepted", "Printing", "Out for Delivery", "Delivered"].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          selectedOrder.order_status === status
                            ? "bg-primary text-white border-primary"
                            : "bg-white dark:bg-gray-950 text-gray-650 dark:text-gray-405 border-gray-200 dark:border-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                <Button variant="primary" onClick={() => setSelectedOrder(null)}>Close</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF View Modal */}
      <AnimatePresence>
        {showPdfModal && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-950 rounded-3xl w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-gray-150 dark:border-gray-850 flex justify-between items-center bg-gray-55 dark:bg-gray-900">
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><FileText /> Document Viewer: {selectedOrder.pdf_file}</span>
                <button 
                  onClick={() => setShowPdfModal(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-8 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
                  <FileText size={48} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{selectedOrder.pdf_file}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8">
                  This document has {selectedOrder.pages} pages. Print layout is configured for <strong>{selectedOrder.color_mode === "color" ? "Color" : "Black & White"}</strong> with <strong>{selectedOrder.binding} binding</strong>.
                </p>
                <button
                  onClick={() => handleDownloadPdf(selectedOrder)}
                  className="bg-primary hover:bg-primary/95 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/15"
                >
                  <Download size={16} /> Download File to Print
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
