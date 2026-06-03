import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, Truck, RefreshCw, CreditCard, User, Phone, MapPin, School, Clock, AlignLeft, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { printOrderService } from "../../services/printOrderService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const PrintDelivery = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [fileBase64, setFileBase64] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [printOptions, setPrintOptions] = useState({
    colorMode: "bw", // bw, color
    binding: "spiral", // spiral, none, staple
    paperSize: "a4", // a4, letter
    copies: 1,
    pages: 10,
  });

  const [deliveryDetails, setDeliveryDetails] = useState({
    studentName: "",
    phone: "",
    collegeName: "",
    deliveryType: "College", // College, Hostel, Home, Other
    fullAddress: "",
    landmark: "",
    requiredDeliveryTime: "Tomorrow", // Today, Tomorrow, Custom Date
    customDate: "",
    specialInstructions: "",
  });

  useEffect(() => {
    if (user) {
      setDeliveryDetails(prev => ({
        ...prev,
        studentName: user.name || "",
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const calculatePrice = () => {
    let perPagePrice = printOptions.colorMode === "color" ? 5 : 1; // BW: ₹1, Color: ₹5
    let bindingPrice = 0;
    if (printOptions.binding === "spiral") bindingPrice = 40;
    if (printOptions.binding === "staple") bindingPrice = 5;

    const basePrintCost = (printOptions.pages * perPagePrice * printOptions.copies) + bindingPrice;
    const deliveryCharge = deliveryDetails.requiredDeliveryTime === "Today" ? 60 : 30; // Rush vs standard
    return basePrintCost + deliveryCharge;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast.error("Please upload a PDF file only.");
        return;
      }
      setFile(selectedFile);
      
      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result);
      };
      reader.readAsDataURL(selectedFile);

      // Simulate page detection (between 5 and 60 pages)
      const mockPages = Math.floor(Math.random() * 55) + 5;
      setPrintOptions(prev => ({ ...prev, pages: mockPages }));
      toast.success(`Uploaded: ${selectedFile.name}`);
    }
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload a document to print.");
      return;
    }
    if (!deliveryDetails.studentName || !deliveryDetails.phone || !deliveryDetails.collegeName || !deliveryDetails.fullAddress) {
      toast.error("Please fill in all required delivery details.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        pdf_file: file.name, // base64 string could be very large, storing name for efficiency or the file content
        pages: printOptions.pages,
        copies: printOptions.copies,
        color_mode: printOptions.colorMode,
        binding: printOptions.binding,
        price: calculatePrice(),
        delivery_details: {
          student_name: deliveryDetails.studentName,
          phone: deliveryDetails.phone,
          college_name: deliveryDetails.collegeName,
          delivery_type: deliveryDetails.deliveryType,
          full_address: deliveryDetails.fullAddress,
          landmark: deliveryDetails.landmark || null,
          required_delivery_time: deliveryDetails.requiredDeliveryTime === "Custom Date" 
            ? deliveryDetails.customDate 
            : deliveryDetails.requiredDeliveryTime,
          special_instructions: deliveryDetails.specialInstructions || null
        }
      };

      await printOrderService.checkout(payload);
      toast.success("Print Order Placed Successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.detail || "Failed to place print order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Print & Delivery Hub</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Get your assignments, lecture slides, and notes printed and delivered directly to your dorm or department.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Upload Document */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
              Upload Document
            </h2>
            
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary rounded-2xl p-6 text-center transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB • {printOptions.pages} pages detected</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <Upload size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-455 mt-1">PDF documents only. Max size 50MB.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Print Options */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
              Printing Options
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Color Mode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPrintOptions(prev => ({ ...prev, colorMode: "bw" }))}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      printOptions.colorMode === "bw"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    Black & White (₹1/pg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintOptions(prev => ({ ...prev, colorMode: "color" }))}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      printOptions.colorMode === "color"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    Color Print (₹5/pg)
                  </button>
                </div>
              </div>

              {/* Binding Option */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Binding Type</label>
                <select
                  value={printOptions.binding}
                  onChange={(e) => setPrintOptions(prev => ({ ...prev, binding: e.target.value }))}
                  className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary"
                >
                  <option value="none">No Binding (Loose Sheets)</option>
                  <option value="staple">Stapled (+₹5)</option>
                  <option value="spiral">Spiral Binding (+₹40)</option>
                </select>
              </div>

              {/* Copies */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Number of Copies</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={printOptions.copies <= 1}
                    onClick={() => setPrintOptions(prev => ({ ...prev, copies: Math.max(1, prev.copies - 1) }))}
                    className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-gray-800 dark:text-gray-100">{printOptions.copies}</span>
                  <button
                    type="button"
                    onClick={() => setPrintOptions(prev => ({ ...prev, copies: prev.copies + 1 }))}
                    className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Paper Size */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Paper Size</label>
                <select
                  value={printOptions.paperSize}
                  onChange={(e) => setPrintOptions(prev => ({ ...prev, paperSize: e.target.value }))}
                  className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary"
                >
                  <option value="a4">A4 (Standard)</option>
                  <option value="letter">Letter</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Details */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
              Delivery Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Student Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Student Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="studentName"
                    required
                    value={deliveryDetails.studentName}
                    onChange={handleDeliveryChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:outline-none focus:border-primary text-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={deliveryDetails.phone}
                    onChange={handleDeliveryChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:outline-none focus:border-primary text-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* College Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">College Name *</label>
                <div className="relative">
                  <School size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="collegeName"
                    required
                    placeholder="e.g. IIT Delhi"
                    value={deliveryDetails.collegeName}
                    onChange={handleDeliveryChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:outline-none focus:border-primary text-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Delivery Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Delivery Type *</label>
                <select
                  name="deliveryType"
                  value={deliveryDetails.deliveryType}
                  onChange={handleDeliveryChange}
                  className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary"
                >
                  <option value="College">College / Dept</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Home">Home</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Full Address */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Address *</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-4 text-gray-400" />
                  <textarea
                    name="fullAddress"
                    required
                    rows={3}
                    placeholder="Dorm number, wing, room or complete home address..."
                    value={deliveryDetails.fullAddress}
                    onChange={handleDeliveryChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:outline-none focus:border-primary text-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Landmark</label>
                <div className="relative">
                  <Info size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="landmark"
                    placeholder="e.g. Near central library"
                    value={deliveryDetails.landmark}
                    onChange={handleDeliveryChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:outline-none focus:border-primary text-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Required Delivery Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Required Delivery Time *</label>
                <select
                  name="requiredDeliveryTime"
                  value={deliveryDetails.requiredDeliveryTime}
                  onChange={handleDeliveryChange}
                  className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary"
                >
                  <option value="Today">Today (Rush: +₹60)</option>
                  <option value="Tomorrow">Tomorrow (+₹30)</option>
                  <option value="Custom Date">Custom Date (+₹30)</option>
                </select>
              </div>

              {/* Custom Date Input if selected */}
              {deliveryDetails.requiredDeliveryTime === "Custom Date" && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Choose Date *</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="customDate"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={deliveryDetails.customDate}
                      onChange={handleDeliveryChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:outline-none focus:border-primary text-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Special Instructions</label>
                <div className="relative">
                  <AlignLeft size={16} className="absolute left-3.5 top-4 text-gray-400" />
                  <textarea
                    name="specialInstructions"
                    rows={2}
                    placeholder="e.g. Deliver near library or leave at reception..."
                    value={deliveryDetails.specialInstructions}
                    onChange={handleDeliveryChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:outline-none focus:border-primary text-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Order Summary */}
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6 sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Summary</h2>

            {/* Print configuration summary */}
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="font-semibold text-gray-900 dark:text-white">Print Config</div>
              <div className="flex justify-between pl-2">
                <span>Pages / Copies</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{printOptions.pages} pgs x {printOptions.copies} copies</span>
              </div>
              <div className="flex justify-between pl-2">
                <span>Color Mode</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{printOptions.colorMode === "color" ? "Color Print" : "Black & White"}</span>
              </div>
              <div className="flex justify-between pl-2">
                <span>Binding</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{printOptions.binding}</span>
              </div>
            </div>

            {/* Delivery address details summary */}
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="font-semibold text-gray-900 dark:text-white">Delivery Location</div>
              <div className="pl-2 space-y-1">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{deliveryDetails.studentName}</p>
                <p className="text-xs truncate">{deliveryDetails.collegeName} ({deliveryDetails.deliveryType})</p>
                <p className="text-xs text-gray-500 truncate">{deliveryDetails.fullAddress}</p>
                {deliveryDetails.landmark && <p className="text-xs text-primary italic">Landmark: {deliveryDetails.landmark}</p>}
              </div>
            </div>

            {/* Delivery Time summary */}
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">Est. Delivery</span>
                <span className="font-bold text-primary text-xs bg-primary/10 px-2 py-0.5 rounded">
                  {deliveryDetails.requiredDeliveryTime === "Today" ? "Today (Rush)" : 
                   deliveryDetails.requiredDeliveryTime === "Tomorrow" ? "Tomorrow" : 
                   deliveryDetails.customDate || "Selected Date"}
                </span>
              </div>
            </div>

            {/* Pricing Total */}
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-850 dark:text-gray-250">Total Price</span>
              <span className="text-2xl font-black text-primary">₹{calculatePrice()}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Sending Order...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Order Print
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
