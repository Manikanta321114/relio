import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PackageSearch, Clock, Package, Truck, CheckCircle, ChevronRight, X, Phone, MapPin, CreditCard, ShieldAlert } from "lucide-react";
import { orderService } from "../../services/orderService";
import { Button } from "../../components/ui/Button";

const statusSteps = [
  { id: 'Pending', label: 'Order Placed', icon: Clock },
  { id: 'Collected', label: 'Collected', icon: Package },
  { id: 'Quality Checked', label: 'Quality Checked', icon: CheckCircle },
  { id: 'Packed', label: 'Packed', icon: Package },
  { id: 'Shipped', label: 'Shipped', icon: Truck },
  { id: 'Out For Delivery', label: 'Out For Delivery', icon: Truck },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle }
];

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndex = (currentStatus) => {
    if (currentStatus === 'Cancelled') return -1;
    return statusSteps.findIndex(s => s.id === currentStatus);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsCancelling(true);
    try {
      await orderService.cancelOrder(orderToCancel.id || orderToCancel._id);
      setOrderToCancel(null);
      await fetchOrders();
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-8"></div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-4">
                <div className="w-20 h-24 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  <div className="h-3 w-20 bg-gray-150 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
      <p className="text-gray-500 mb-8">Track, cancel, and view details of your purchases.</p>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center shadow-sm">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <PackageSearch size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">Looks like you haven't bought anything yet.</p>
          <Button variant="primary" onClick={() => window.location.href='/'}>Start Shopping</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusIdx = getStatusIndex(order.status);
            const isCancelled = order.status === 'Cancelled';

            return (
              <motion.div 
                key={order.id || order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex gap-6">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Placed</div>
                      <div className="text-sm font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</div>
                      <div className="text-sm font-medium text-gray-900">₹{order.total_amount}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order ID</div>
                    <div className="text-sm font-semibold text-blue-600">{order.order_id}</div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  {/* Product Info */}
                  <div className="flex gap-4 md:w-1/3">
                    <div className="w-24 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100">
                      {order.book_image ? (
                        <img src={order.book_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={24} /></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{order.book_title}</h4>
                      <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md mb-2">
                        {order.payment_method}
                      </span>
                    </div>
                  </div>

                  {/* Tracker */}
                  <div className="flex-1">
                    {isCancelled ? (
                      <div className="flex items-center text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100">
                        <X className="mr-2" size={20} />
                        <span className="font-semibold">Order Cancelled</span>
                      </div>
                    ) : (
                      <div className="relative pt-6 pb-2">
                        <div className="absolute top-10 left-6 right-6 h-1 bg-gray-100 rounded-full"></div>
                        <div 
                          className="absolute top-10 left-6 h-1 bg-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${(statusIdx / (statusSteps.length - 1)) * 100}%` }}
                        ></div>
                        
                        <div className="flex justify-between relative z-10">
                          {statusSteps.map((step, idx) => {
                            const isCompleted = idx <= statusIdx;
                            const isCurrent = idx === statusIdx;
                            const Icon = step.icon;
                            
                            return (
                              <div key={step.id} className="flex flex-col items-center group relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                                  {isCompleted ? <CheckCircle size={16} /> : <Icon size={14} />}
                                </div>
                                <span className={`text-[10px] mt-2 font-medium whitespace-nowrap hidden sm:block ${isCurrent ? 'text-green-600 font-bold' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                  <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>View Details</Button>
                  {!isCancelled && statusIdx < 2 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:bg-red-50 hover:border-red-200 border-red-100"
                      onClick={() => setOrderToCancel(order)}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 border border-gray-100"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-sm text-gray-500 mt-1">ID: <span className="font-semibold text-blue-600">{selectedOrder.order_id}</span></p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Book Info */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                    {selectedOrder.book_image ? (
                      <img src={selectedOrder.book_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={20} /></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{selectedOrder.book_title}</h3>
                    <p className="text-sm text-gray-500 mt-1">Ordered on: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded">
                        {selectedOrder.payment_method}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                {selectedOrder.status !== 'Cancelled' && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Tracking History</h4>
                    <div className="space-y-4">
                      {statusSteps.map((step, idx) => {
                        const orderIdx = getStatusIndex(selectedOrder.status);
                        const isCompleted = idx <= orderIdx;
                        const isCurrent = idx === orderIdx;
                        const Icon = step.icon;

                        return (
                          <div key={step.id} className="flex gap-4 relative">
                            {idx < statusSteps.length - 1 && (
                              <div className={`absolute left-3 top-6 w-0.5 h-8 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            )}
                            <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0 border z-10 ${
                              isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-400'
                            }`}>
                              {isCompleted ? <CheckCircle size={12} /> : <Icon size={10} />}
                            </div>
                            <div className="flex-1 pb-2">
                              <p className={`text-sm font-semibold ${isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                {step.label}
                              </p>
                              {isCurrent && (
                                <p className="text-xs text-gray-500 mt-0.5">Currently processing this step</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Expected Delivery & Current Location */}
                {selectedOrder.status !== 'Cancelled' && (
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Expected Delivery</span>
                      <span className="text-sm font-bold text-gray-900 mt-1 block">
                        {new Date(new Date(selectedOrder.created_at).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Current Location</span>
                      <span className="text-sm font-bold text-blue-700 mt-1 block">
                        {selectedOrder.status === 'Pending' && "Awaiting pickup from Seller Warehouse"}
                        {selectedOrder.status === 'Collected' && "Relio Quality Check Center"}
                        {selectedOrder.status === 'Quality Checked' && "Relio Quality Inspection Hub"}
                        {selectedOrder.status === 'Packed' && "Relio Fulfillment Hub"}
                        {selectedOrder.status === 'Shipped' && "In Transit to Destination City"}
                        {selectedOrder.status === 'Out For Delivery' && "Out for Delivery with Partner"}
                        {selectedOrder.status === 'Delivered' && "Delivered to Customer"}
                      </span>
                    </div>
                  </div>
                )}


                {/* Delivery details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-3">
                      <MapPin size={16} className="text-blue-500" />
                      <span>Shipping Address</span>
                    </div>
                    {selectedOrder.shipping_address ? (
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-semibold text-gray-800">{selectedOrder.shipping_address.full_name || "N/A"}</p>
                        <p>{selectedOrder.shipping_address.house_no || ""}, {selectedOrder.shipping_address.street || ""}</p>
                        <p>{selectedOrder.shipping_address.area || ""}{selectedOrder.shipping_address.landmark && ` (${selectedOrder.shipping_address.landmark})`}</p>
                        <p>{selectedOrder.shipping_address.city || ""}, {selectedOrder.shipping_address.state || ""} - {selectedOrder.shipping_address.pincode || ""}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No shipping address provided</p>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-3">
                      <Phone size={16} className="text-blue-500" />
                      <span>Contact Info</span>
                    </div>
                    {selectedOrder.shipping_address ? (
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium text-gray-800">Primary Mobile:</span> {selectedOrder.shipping_address.phone || "N/A"}</p>
                        {selectedOrder.shipping_address.alt_phone && (
                          <p><span className="font-medium text-gray-800">Alternate Mobile:</span> {selectedOrder.shipping_address.alt_phone}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No contact info available</p>
                    )}
                  </div>
                </div>

                {/* Payment & Price Summary */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-4">
                    <CreditCard size={16} className="text-blue-500" />
                    <span>Payment & Billing</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Method:</span>
                      <span className="font-semibold text-gray-800">{selectedOrder.payment_method} (Status: {selectedOrder.payment_status})</span>
                    </div>
                    <hr className="border-gray-200 my-2" />
                    <div className="flex justify-between">
                      <span className="text-gray-500">Book Price:</span>
                      <span className="font-medium text-gray-800">₹{selectedOrder.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery Charge:</span>
                      <span className="font-medium text-gray-800">₹{selectedOrder.delivery_charge}</span>
                    </div>
                    {selectedOrder.packaging_charge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Packaging Charge:</span>
                        <span className="font-medium text-gray-800">₹{selectedOrder.packaging_charge}</span>
                      </div>
                    )}
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-₹{selectedOrder.discount}</span>
                      </div>
                    )}
                    <hr className="border-gray-250 my-2" />
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-gray-900">Total Paid:</span>
                      <span className="text-blue-600">₹{selectedOrder.total_amount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <Button variant="primary" onClick={() => setSelectedOrder(null)}>Close</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CANCEL CONFIRMATION MODAL */}
      <AnimatePresence>
        {orderToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 border border-gray-100 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Order</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to cancel your order for <span className="font-semibold text-gray-800">"{orderToCancel.book_title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setOrderToCancel(null)}
                  disabled={isCancelling}
                >
                  No, Keep Order
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling..." : "Yes, Cancel Order"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
