import { useState, useEffect } from "react";
import { PackageSearch, Search, Filter, Phone, MapPin, CheckCircle, XCircle, Package, Truck, Copy, ExternalLink, Calendar, BookOpen, User, Mail, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { adminService } from "../../services/adminService";
import { AdminTable } from "../../components/admin/AdminTable";
import { AdminEmptyState } from "../../components/admin/AdminEmptyState";
import { AdminSkeleton } from "../../components/admin/AdminSkeleton";
import { Button } from "../../components/ui/Button";

const STATUSES = ['All Orders', 'Pending', 'Collected', 'Quality Checked', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'];

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals state
  const [confirmAction, setConfirmAction] = useState(null); // { id, newStatus, title, desc }
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null); // Full order details modal
  const [selectedBookDetails, setSelectedBookDetails] = useState(null); // Clicked book details sub-modal

  // Price adjustment states
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [pricingForm, setPricingForm] = useState({
    price: 0,
    delivery_charge: 0,
    packaging_charge: 0,
    discount: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, debouncedSearch]);

  // Populate pricing form when modal opens
  useEffect(() => {
    if (selectedOrderDetails) {
      setPricingForm({
        price: selectedOrderDetails.book_price || selectedOrderDetails.price || 0,
        delivery_charge: selectedOrderDetails.delivery_charge || 0,
        packaging_charge: selectedOrderDetails.packaging_charge || 0,
        discount: selectedOrderDetails.discount || 0
      });
      setIsEditingPricing(false);
    }
  }, [selectedOrderDetails]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getOrders(
        statusFilter === 'All Orders' ? '' : statusFilter, 
        debouncedSearch
      );
      setOrders(data);
    } catch (error) {
      toast.error("Failed to load orders");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      await adminService.updateOrderStatus(id, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      setConfirmAction(null);
      
      // Update selected order details state too if open
      if (selectedOrderDetails && selectedOrderDetails.id === id) {
        setSelectedOrderDetails(prev => ({ ...prev, status: newStatus }));
      }
      
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update status");
      fetchOrders();
    }
  };

  const executeAction = (id, newStatus) => {
    setConfirmAction({
      id,
      newStatus,
      title: `Confirm ${newStatus}?`,
      desc: `Are you sure you want to mark this order as ${newStatus}? This will trigger a notification.`
    });
  };

  const copyToClipboard = (text, type = "Address") => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const getActionButtons = (order) => {
    const s = order.status;
    if (s === 'Pending') {
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => executeAction(order.id, 'Cancelled')}>Reject</Button>
          <Button variant="primary" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => executeAction(order.id, 'Collected')}>Collect Book</Button>
        </div>
      );
    }
    if (s === 'Collected') return <Button size="sm" variant="outline" className="w-full" onClick={() => executeAction(order.id, 'Quality Checked')}><CheckCircle size={14} className="mr-1"/> Quality Check</Button>;
    if (s === 'Quality Checked') return <Button size="sm" variant="outline" className="w-full" onClick={() => executeAction(order.id, 'Packed')}><Package size={14} className="mr-1"/> Pack Book</Button>;
    if (s === 'Packed') return <Button size="sm" variant="outline" className="w-full" onClick={() => executeAction(order.id, 'Shipped')}><Truck size={14} className="mr-1"/> Ship Book</Button>;
    if (s === 'Shipped') return <Button size="sm" variant="outline" className="w-full" onClick={() => executeAction(order.id, 'Out For Delivery')}><Truck size={14} className="mr-1"/> Out For Delivery</Button>;
    if (s === 'Out For Delivery') return <Button size="sm" variant="primary" className="w-full" onClick={() => executeAction(order.id, 'Delivered')}><CheckCircle size={14} className="mr-1"/> Deliver Order</Button>;
    
    return <span className="text-gray-500 font-medium">{s}</span>;
  };

  const columns = [
    { header: "Order ID", className: "w-1/6" },
    { header: "Customer & Delivery", className: "w-2/6" },
    { header: "Product Details", className: "w-2/6" },
    { header: "Payment & Actions", className: "w-1/6" }
  ];

  const renderRow = (order) => (
    <>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-bold text-blue-600">{order.order_id || `#ORD${order.id.slice(-6).toUpperCase()}`}</div>
        <div className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
        <div className={`mt-2 inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${
          ['Delivered', 'Collected', 'Quality Checked', 'Packed', 'Shipped', 'Out For Delivery'].includes(order.status) ? 'bg-green-100 text-green-700' :
          order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {order.status}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <div className="font-bold text-gray-900">{order.buyer_name}</div>
          <div className="flex items-center text-gray-500 text-xs mt-1"><Phone size={12} className="mr-1"/> {order.buyer_phone}</div>
          {order.shipping_address && (
            <div className="mt-2 text-xs text-gray-500 flex items-start">
              <MapPin size={12} className="mr-1 shrink-0 mt-0.5"/>
              <span className="line-clamp-2">{order.shipping_address.house_no}, {order.shipping_address.street}, {order.shipping_address.area}, {order.shipping_address.city}</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center cursor-pointer" onClick={() => setSelectedBookDetails(order)}>
          {order.book_image ? (
            <img src={order.book_image} alt="" className="w-12 h-16 object-cover rounded shadow-sm mr-4 hover:opacity-85" />
          ) : (
            <div className="w-12 h-16 bg-gray-100 rounded mr-4 flex items-center justify-center text-xs text-gray-400">No Img</div>
          )}
          <div>
            <div className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-primary transition-colors" title={order.book_title}>{order.book_title}</div>
            <div className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-1">Category: <span className="font-semibold text-gray-700">{order.book_category || 'General'}</span></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col space-y-3">
          <div>
            <div className="text-lg font-bold text-green-600">₹{order.total_amount}</div>
            <div className="text-xs text-gray-500 font-medium">Method: {order.payment_method}</div>
            <div className="text-xs text-gray-500 font-medium">Payment: {order.payment_status}</div>
          </div>
          <div className="pt-2 border-t border-gray-100 space-y-2">
            {getActionButtons(order)}
            <Button size="sm" variant="outline" className="w-full text-xs py-1" onClick={() => setSelectedOrderDetails(order)}>View Details</Button>
          </div>
        </div>
      </td>
    </>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders Management</h1>
          <p className="text-gray-500 mt-2">Manage all incoming orders, track shipments, process collections and deliveries.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID, Name, or Phone" 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative md:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <AdminSkeleton count={5} type="list" />
      ) : orders.length > 0 ? (
        <AdminTable columns={columns} data={orders} renderRow={renderRow} />
      ) : (
        <AdminEmptyState
          icon={PackageSearch}
          title="No orders found"
          description={searchQuery || statusFilter !== 'All Orders' ? "Try adjusting your filters or search query." : "When buyers place orders, they will appear here."}
        />
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center border border-gray-100"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Package size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmAction.title}</h3>
              <p className="text-gray-500 mb-8">{confirmAction.desc}</p>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmAction(null)}>Cancel</Button>
                <Button variant="primary" className="flex-1" onClick={() => handleStatusChange(confirmAction.id, confirmAction.newStatus)}>Confirm</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED ORDER MODAL */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl my-8 border border-gray-100"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order Information Console</h2>
                  <p className="text-sm text-gray-500 mt-1">ID: <span className="font-semibold text-blue-600">{selectedOrderDetails.order_id}</span> | Placed: {new Date(selectedOrderDetails.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    ['Delivered', 'Collected', 'Quality Checked', 'Packed', 'Shipped', 'Out For Delivery'].includes(selectedOrderDetails.status) ? 'bg-green-100 text-green-700' :
                    selectedOrderDetails.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedOrderDetails.status}
                  </span>
                  <button 
                    onClick={() => setSelectedOrderDetails(null)} 
                    className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600 bg-white border border-gray-100"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: Book Details & Billing */}
                <div className="space-y-6 col-span-1">
                  
                  {/* Book Info */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4">
                    <div 
                      className="w-20 h-28 bg-gray-200 rounded-xl overflow-hidden shrink-0 shadow-sm cursor-pointer hover:opacity-85"
                      onClick={() => setSelectedBookDetails(selectedOrderDetails)}
                    >
                      {selectedOrderDetails.book_image ? (
                        <img src={selectedOrderDetails.book_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><BookOpen size={24} /></div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 
                        className="font-bold text-gray-900 leading-tight text-lg hover:text-primary cursor-pointer transition-colors"
                        onClick={() => setSelectedBookDetails(selectedOrderDetails)}
                      >
                        {selectedOrderDetails.book_title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Category: <span className="font-semibold text-gray-700">{selectedOrderDetails.book_category}</span></p>
                      <p className="text-xs text-gray-500">Condition: <span className="font-semibold text-orange-600">{selectedOrderDetails.book_condition}</span></p>
                      <span className="text-xl font-extrabold text-green-600 mt-2 block">₹{selectedOrderDetails.book_price}</span>
                    </div>
                  </div>

                  {/* Pricing Management Card */}
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 text-sm">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <h4 className="font-bold text-gray-800">Pricing & Cost Management</h4>
                      <Button 
                        size="xs" 
                        variant={isEditingPricing ? "primary" : "outline"} 
                        onClick={async () => {
                          if (isEditingPricing) {
                            try {
                              const updatedTotal = pricingForm.price + pricingForm.delivery_charge + pricingForm.packaging_charge - pricingForm.discount;
                              await adminService.updateOrderPricing(selectedOrderDetails.id, pricingForm);
                              setSelectedOrderDetails(prev => ({
                                ...prev,
                                book_price: pricingForm.price,
                                price: pricingForm.price,
                                delivery_charge: pricingForm.delivery_charge,
                                packaging_charge: pricingForm.packaging_charge,
                                discount: pricingForm.discount,
                                total_amount: updatedTotal
                              }));
                              toast.success("Order pricing updated successfully!");
                              setIsEditingPricing(false);
                              fetchOrders();
                            } catch (e) {
                              toast.error("Failed to update pricing");
                            }
                          } else {
                            setIsEditingPricing(true);
                          }
                        }}
                      >
                        {isEditingPricing ? "Save Pricing" : "Edit Pricing"}
                      </Button>
                    </div>

                    {isEditingPricing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Book Price (₹)</label>
                          <input 
                            type="number" 
                            value={pricingForm.price} 
                            onChange={(e) => setPricingForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                            className="w-full border border-gray-250 rounded-xl px-3 py-2 text-sm bg-white" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Delivery Charge (₹)</label>
                          <input 
                            type="number" 
                            value={pricingForm.delivery_charge} 
                            onChange={(e) => setPricingForm(prev => ({ ...prev, delivery_charge: parseFloat(e.target.value) || 0 }))}
                            className="w-full border border-gray-250 rounded-xl px-3 py-2 text-sm bg-white" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Packaging Charge (₹)</label>
                          <input 
                            type="number" 
                            value={pricingForm.packaging_charge} 
                            onChange={(e) => setPricingForm(prev => ({ ...prev, packaging_charge: parseFloat(e.target.value) || 0 }))}
                            className="w-full border border-gray-250 rounded-xl px-3 py-2 text-sm bg-white" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Discount (₹)</label>
                          <input 
                            type="number" 
                            value={pricingForm.discount} 
                            onChange={(e) => setPricingForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                            className="w-full border border-gray-250 rounded-xl px-3 py-2 text-sm bg-white" 
                          />
                        </div>
                        <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-blue-600">
                          <span>Auto Calculated Total:</span>
                          <span>₹{pricingForm.price + pricingForm.delivery_charge + pricingForm.packaging_charge - pricingForm.discount}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Book Price:</span>
                          <span className="font-semibold text-gray-800">₹{selectedOrderDetails.book_price || selectedOrderDetails.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery Charge:</span>
                          <span className="font-semibold text-gray-800">₹{selectedOrderDetails.delivery_charge}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Packaging Charge:</span>
                          <span className="font-semibold text-gray-800">₹{selectedOrderDetails.packaging_charge || 0}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>- ₹{selectedOrderDetails.discount}</span>
                        </div>
                        <hr className="border-gray-200" />
                        <div className="flex justify-between text-base font-bold">
                          <span className="text-gray-900">Total Payable Amount:</span>
                          <span className="text-blue-600">₹{selectedOrderDetails.total_amount}</span>
                        </div>
                        <div className="flex justify-between text-xs pt-1.5 border-t border-gray-150 text-gray-500">
                          <span>Payment Method:</span>
                          <span className="font-semibold">{selectedOrderDetails.payment_method} ({selectedOrderDetails.payment_status})</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Workflow Actions */}
                  <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-3">
                    <h4 className="font-bold text-blue-900 text-sm">Step Progression Workflows</h4>
                    <div className="pt-2">
                      {getActionButtons(selectedOrderDetails)}
                    </div>
                  </div>
                </div>

                {/* Right Column: Buyer & Seller Info */}
                <div className="space-y-6 col-span-1">
                  
                  {/* Seller Info (Pickup details) */}
                  <div className="p-5 bg-orange-50/40 border border-orange-100/50 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center border-b border-orange-100 pb-2">
                      <h4 className="font-bold text-orange-950 flex items-center gap-2"><User size={18} /> Seller Pickup Information</h4>
                      <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded uppercase tracking-wider">Source</span>
                    </div>
                    <div className="text-sm space-y-2 text-gray-700">
                      <p><span className="font-semibold text-gray-900">Name:</span> {selectedOrderDetails.seller_name}</p>
                      <p className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">Phone:</span> 
                        <a href={`tel:${selectedOrderDetails.seller_phone}`} className="text-blue-600 font-bold hover:underline">{selectedOrderDetails.seller_phone}</a>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">Email:</span> 
                        <a href={`mailto:${selectedOrderDetails.seller_email}`} className="text-gray-600 hover:underline">{selectedOrderDetails.seller_email}</a>
                      </p>
                      <div className="p-3 bg-white rounded-xl border border-orange-100 mt-2">
                        <span className="text-xs font-bold text-orange-800 uppercase tracking-wider block mb-1">Pickup Destination Address</span>
                        <span className="text-sm text-gray-600 block leading-relaxed">{selectedOrderDetails.seller_pickup_address}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      <a 
                        href={`tel:${selectedOrderDetails.seller_phone}`}
                        className="flex-1 min-w-[120px] px-3 py-2 bg-orange-600 text-white rounded-xl text-center text-xs font-bold hover:bg-orange-700 transition-colors shadow-sm flex items-center justify-center gap-1"
                      >
                        <Phone size={12} /> Call Seller
                      </a>
                      <button 
                        onClick={() => copyToClipboard(selectedOrderDetails.seller_pickup_address, "Seller Pickup Address")}
                        className="flex-1 min-w-[120px] px-3 py-2 bg-white text-orange-800 border border-orange-200 rounded-xl text-xs font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <Copy size={12} /> Copy Address
                      </button>
                    </div>
                  </div>

                  {/* Buyer Info (Delivery details) */}
                  <div className="p-5 bg-green-50/40 border border-green-100/50 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center border-b border-green-100 pb-2">
                      <h4 className="font-bold text-green-950 flex items-center gap-2"><Truck size={18} /> Buyer Delivery Information</h4>
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded uppercase tracking-wider">Destination</span>
                    </div>
                    <div className="text-sm space-y-2 text-gray-700">
                      <p><span className="font-semibold text-gray-900">Customer Name:</span> {selectedOrderDetails.buyer_name}</p>
                      <p className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">Phone:</span> 
                        <a href={`tel:${selectedOrderDetails.buyer_phone}`} className="text-blue-600 font-bold hover:underline">{selectedOrderDetails.buyer_phone}</a>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">Email:</span> 
                        <span className="text-gray-600">{selectedOrderDetails.buyer_email}</span>
                      </p>
                      <div className="p-3 bg-white rounded-xl border border-green-100 mt-2">
                        <span className="text-xs font-bold text-green-800 uppercase tracking-wider block mb-1">Buyer Delivery Address</span>
                        <span className="text-sm text-gray-600 block leading-relaxed">
                          {selectedOrderDetails.shipping_address?.house_no}, {selectedOrderDetails.shipping_address?.street}, {selectedOrderDetails.shipping_address?.area}, {selectedOrderDetails.shipping_address?.city}, {selectedOrderDetails.shipping_address?.state} - {selectedOrderDetails.shipping_address?.pincode}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <Button variant="primary" onClick={() => setSelectedOrderDetails(null)}>Close Console</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOOK DETAILS SUB-MODAL */}
      <AnimatePresence>
        {selectedBookDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 border border-gray-100 relative my-8"
            >
              <button 
                onClick={() => setSelectedBookDetails(null)} 
                className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 bg-white border border-gray-100 z-10"
              >
                ✕
              </button>

              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><BookOpen className="text-primary" /> Book Specifications Overview</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Images */}
                <div className="col-span-1 space-y-4">
                  <div className="w-full aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center">
                    {selectedBookDetails.book_image ? (
                      <img src={selectedBookDetails.book_image} alt="Front Cover" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">No Cover Image</span>
                    )}
                  </div>
                  {selectedBookDetails.book_back_image && (
                    <div className="w-full aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center">
                      <img src={selectedBookDetails.book_back_image} alt="Back Cover" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Technical Meta & Description */}
                <div className="col-span-1 sm:col-span-2 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="text-xl font-extrabold text-gray-900 leading-tight">{selectedBookDetails.book_title}</h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100">
                        Category: {selectedBookDetails.book_category}
                      </span>
                      <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-md border border-orange-100">
                        Condition: {selectedBookDetails.book_condition}
                      </span>
                    </div>
                    <span className="text-2xl font-extrabold text-green-600 block pt-2">₹{selectedBookDetails.book_price}</span>
                    <hr className="border-gray-100" />
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Seller Notes & Description</span>
                      <p className="text-sm text-gray-600 leading-relaxed max-h-32 overflow-y-auto">{selectedBookDetails.book_description || "No seller notes provided."}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Upload Date:</span>
                      <span className="font-semibold text-gray-700 flex items-center gap-1"><Calendar size={12} /> {selectedBookDetails.book_created_at ? new Date(selectedBookDetails.book_created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Source Seller:</span>
                      <span className="font-semibold text-gray-700">{selectedBookDetails.seller_name}</span>
                    </div>
                    {/* PRICING AUDIT LOGS */}
                    <div className="pt-3 border-t border-gray-150 mt-3 space-y-1.5 text-xs text-gray-400">
                      <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Pricing Audit Logs</span>
                      <div className="flex justify-between">
                        <span>Original Seller Price:</span>
                        <span className="font-semibold text-gray-600">₹{selectedBookDetails.book_price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Admin Price Override:</span>
                        <span className="font-semibold text-primary">₹{selectedBookDetails.book_price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Audit Status:</span>
                        <span className="font-bold text-green-600 uppercase tracking-wider text-[9px]">Verified & Live</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="primary" onClick={() => setSelectedBookDetails(null)}>Back to Order Details</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
