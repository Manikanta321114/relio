import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, MapPin, Truck, CreditCard, ShoppingBag, Info } from "lucide-react";
import toast from "react-hot-toast";
import { marketplaceService } from "../../services/marketplaceService";
import { orderService } from "../../services/orderService";
import { Button } from "../../components/ui/Button";
import { getCurrentLocation } from "../../utils/location";

export const CheckoutPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [step, setStep] = useState(1); // 1: Address, 2: Summary, 3: Payment
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [address, setAddress] = useState({
    full_name: "",
    phone: "",
    alt_phone: "",
    house_no: "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: ""
  });

  const handleUseCurrentLocation = async () => {
    setIsDetecting(true);
    try {
      const locationData = await getCurrentLocation();
      setAddress(prev => ({
        ...prev,
        state: locationData.state,
        city: locationData.city,
        area: locationData.area,
        pincode: locationData.pincode
      }));
      toast.success("Location populated successfully!");
    } catch (error) {
      if (error.message === "PERMISSION_DENIED") {
        toast.error("Location access denied. Please enter address manually.");
      } else {
        toast.error("Unable to detect location.");
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const [paymentMethod, setPaymentMethod] = useState("COD"); // 'COD' or 'ONLINE'

  useEffect(() => {
    fetchBook();
    window.scrollTo(0, 0);
  }, [bookId]);

  const fetchBook = async () => {
    try {
      const data = await marketplaceService.getBookById(bookId);
      setBook(data);
    } catch (error) {
      toast.error("Failed to load book details");
      navigate("/marketplace");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const validateAddress = () => {
    const required = ["full_name", "phone", "house_no", "street", "area", "city", "state", "pincode"];
    for (const field of required) {
      if (!address[field].trim()) {
        toast.error(`Please fill in all required fields.`);
        return false;
      }
    }
    if (!/^\d{10}$/.test(address.phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error("Please enter a valid 6-digit Pincode.");
      return false;
    }
    return true;
  };

  const proceedToSummary = () => {
    if (validateAddress()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const proceedToPayment = () => {
    setStep(3);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod !== "COD") {
      toast.error("Please select a valid payment method");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await orderService.createCheckoutOrder(book.id, address, paymentMethod);
      toast.success("Order placed successfully");
      navigate("/my-orders");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse">Loading Checkout...</div>;
  if (!book) return null;

  const price = book.price;
  const deliveryCharge = 40;
  const total = price + deliveryCharge;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {step < 4 && (
        <button onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)} className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> {step === 1 ? 'Back to Book' : 'Back'}
        </button>
      )}

      {/* Progress Steps */}
      {step < 4 && (
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full -z-10"></div>
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {['Delivery Details', 'Order Summary', 'Payment'].map((label, index) => {
            const stepNum = index + 1;
            const isActive = step >= stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={label} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${isActive ? 'bg-primary text-white scale-110' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                  {isActive && !isCurrent ? <CheckCircle size={20} /> : stepNum}
                </div>
                <span className={`text-xs mt-2 font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center"><MapPin className="mr-2 text-primary" /> Delivery Details</h2>
              
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl mb-6 text-sm text-primary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start">
                  <span className="font-semibold mr-2">Address Auto-fill:</span> Populate billing fields with your current location.
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleUseCurrentLocation}
                  disabled={isDetecting}
                  className="shrink-0 text-xs py-1.5 px-3 border-primary text-primary hover:bg-primary/10"
                >
                  {isDetecting ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Detecting Location...
                    </div>
                  ) : "📍 Use Current Location"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" name="full_name" value={address.full_name} onChange={handleAddressChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input type="tel" name="phone" value={address.phone} onChange={handleAddressChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" placeholder="10-digit mobile number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input type="text" name="pincode" value={address.pincode} onChange={handleAddressChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" placeholder="6-digit Pincode" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input type="text" name="city" value={address.city} onChange={handleAddressChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" placeholder="City" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input type="text" name="state" value={address.state} onChange={handleAddressChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" placeholder="State" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">House / Flat No., Building Name *</label>
                  <input type="text" name="house_no" value={address.house_no} onChange={handleAddressChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" placeholder="House/Flat No." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input type="text" name="street" value={address.street} onChange={handleAddressChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" placeholder="Street Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area / Locality *</label>
                  <input type="text" name="area" value={address.area} onChange={handleAddressChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" placeholder="Area" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                  <input type="text" name="landmark" value={address.landmark} onChange={handleAddressChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" placeholder="e.g. Near Apollo Hospital" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Mobile Number (Optional)</label>
                  <input type="tel" name="alt_phone" value={address.alt_phone} onChange={handleAddressChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" placeholder="Alternative contact number" />
                </div>
              </div>

              <div className="mt-8">
                <Button variant="primary" className="w-full py-4 text-lg shadow-xl shadow-primary/20" onClick={proceedToSummary}>
                  Deliver Here
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center"><ShoppingBag className="mr-2 text-primary" /> Order Summary</h2>
              
              <div className="flex gap-6 pb-6 border-b border-gray-100 mb-6">
                <div className="w-24 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0 shadow-sm">
                  {book.front_image && <img src={book.front_image} className="w-full h-full object-cover" alt="book" />}
                </div>
                <div className="flex flex-col flex-1 justify-center">
                  <h3 className="font-bold text-xl text-gray-900 mb-1">{book.title}</h3>
                  <div className="text-sm text-gray-500 mb-2">Category: {book.category} | Condition: {book.condition}</div>
                  <div className="text-2xl font-bold text-green-600">₹{book.price}</div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Book Price</span>
                  <span className="font-medium text-gray-900">₹{price}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge</span>
                  <span className="font-medium text-gray-900">₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span className="font-medium text-green-600">- ₹0</span>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">₹{total}</span>
                </div>
              </div>

              <div className="bg-blue-50/50 text-blue-800 p-4 rounded-xl text-sm flex items-start mb-8 border border-blue-100">
                <Info size={18} className="mr-2 mt-0.5 shrink-0" />
                <p>Relio guarantees safe delivery and authentic products. Standard delivery takes 3-5 business days.</p>
              </div>

              <Button variant="primary" className="w-full py-4 text-lg shadow-xl shadow-primary/20" onClick={proceedToPayment}>
                Continue to Payment
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center"><CreditCard className="mr-2 text-primary" /> Payment Method</h2>
              
              <div className="space-y-4 mb-8">
                {/* Cash on Delivery Card */}
                <div 
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center shrink-0 mt-0.5 ${paymentMethod === 'COD' ? 'border-primary' : 'border-gray-300'}`}>
                    {paymentMethod === 'COD' && <div className="w-3 h-3 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-gray-900 text-lg">💵 Cash on Delivery</h4>
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Available</span>
                    </div>
                    <p className="text-gray-500 text-sm">Pay when your order arrives at your doorstep.</p>
                  </div>
                </div>

                {/* Online Payment Card (Coming Soon) */}
                <div 
                  className="p-5 rounded-2xl border-2 border-gray-200 bg-gray-50 transition-all cursor-pointer flex items-start opacity-70"
                  onClick={() => {
                    toast.custom((t) => (
                      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4"><CreditCard size={24} /></div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Online Payments Coming Soon</h3>
                        <p className="text-sm text-gray-500 mb-6">We are currently working on UPI and Card payments. Please use Cash on Delivery for now.</p>
                        <Button variant="primary" className="w-full" onClick={() => toast.dismiss(t.id)}>OK</Button>
                      </div>
                    ));
                  }}
                >
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 mr-4 shrink-0 mt-0.5"></div>
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-1 w-full">
                      <h4 className="font-bold text-gray-900 text-lg">💳 Online Payment</h4>
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full tracking-wider uppercase">Coming Soon</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-2">UPI, Google Pay, PhonePe, Paytm, Debit/Credit Card</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center mb-8 border border-gray-100">
                <span className="text-gray-600 font-medium">Total Payable Amount:</span>
                <span className="text-2xl font-bold text-gray-900">₹{total}</span>
              </div>

              <Button 
                variant="primary" 
                className="w-full py-4 text-lg shadow-xl shadow-primary/20" 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing Order...
                  </div>
                ) : "PLACE ORDER"}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-8 sm:p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Successfully Placed</h2>
              <p className="text-gray-500 mb-8">Your order has been confirmed and is being processed.</p>
              
              <div className="bg-gray-50 w-full rounded-2xl p-6 text-left border border-gray-100 mb-8">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-gray-500">Order ID:</div>
                  <div className="font-bold text-gray-900 text-right">{orderId}</div>
                  
                  <div className="text-gray-500">Payment Method:</div>
                  <div className="font-bold text-gray-900 text-right">Cash on Delivery</div>
                  
                  <div className="text-gray-500">Amount to Pay:</div>
                  <div className="font-bold text-green-600 text-right">₹{total}</div>
                  
                  <div className="text-gray-500">Status:</div>
                  <div className="font-bold text-orange-500 text-right">Pending Confirmation</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button variant="outline" className="flex-1 py-4" onClick={() => navigate("/marketplace")}>
                  Continue Shopping
                </Button>
                <Button variant="primary" className="flex-1 py-4 shadow-xl shadow-primary/20" onClick={() => navigate("/my-orders")}>
                  View My Orders
                </Button>
                <Button variant="secondary" className="flex-1 py-4 shadow-md bg-blue-100 text-blue-800 hover:bg-blue-200" onClick={() => navigate("/my-orders")}>
                  Track Order
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
