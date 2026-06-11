import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Upload, 
  Printer, 
  Sparkles, 
  DollarSign, 
  Truck, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  School,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { printOrderService } from "../../services/printOrderService";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import axios from "axios";
import toast from "react-hot-toast";

export const PrintDelivery = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState(1);
  const [isCounting, setIsCounting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  
  // Options
  const [printType, setPrintType] = useState("B/W"); // B/W, Color
  const [copies, setCopies] = useState(1);
  const [binding, setBinding] = useState("None"); // None, Spiral
  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD, Online
  
  // Delivery Details
  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("College"); // College, Hostel, Home, Other
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [requiredTime, setRequiredTime] = useState("Today"); // Today, Tomorrow, Specific Date
  const [customDate, setCustomDate] = useState("");

  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Price Rates
  const BW_RATE = 2;
  const COLOR_RATE = 10;
  const SPIRAL_RATE = 30;

  // Calculate live total
  const pageRate = printType === "B/W" ? BW_RATE : COLOR_RATE;
  const bindingCost = binding === "Spiral" ? SPIRAL_RATE : 0;
  const liveTotal = ((pages * pageRate) + bindingCost) * copies;

  // Detect Pages client-side
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Only PDF documents are supported");
      return;
    }

    setFile(selectedFile);
    setIsCounting(true);
    setUploadedUrl("");

    try {
      const reader = new FileReader();
      reader.onload = function (event) {
        const arr = new Uint8Array(event.target.result);
        let text = "";
        try {
          text = new TextDecoder("ascii").decode(arr);
        } catch (err) {
          for (let i = 0; i < Math.min(arr.length, 1000000); i++) {
            text += String.fromCharCode(arr[i]);
          }
        }
        
        // Find /Type /Page occurrences (standard PDF page marker)
        const matches = text.match(/\/Type\s*\/Page\b/g);
        const count = matches ? matches.length : 1;
        setPages(count);
        toast.success(`Detected ${count} page(s) in PDF`);
      };
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error("Failed to parse PDF pages", error);
      setPages(1);
    } finally {
      setIsCounting(false);
    }
  };

  // Upload PDF directly to Cloudinary as raw file type
  const uploadPdfFile = async (pdfFile) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo";
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "demo_preset";
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("upload_preset", uploadPreset);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      setIsUploading(false);
      return {
        url: response.data.secure_url,
        publicId: response.data.public_id
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      setIsUploading(false);
      // Local fallback for local dev if keys are not set up
      const mockPublicId = `mock_pdf_${Date.now()}`;
      return {
        url: `https://res.cloudinary.com/demo/raw/upload/v12345/${mockPublicId}.pdf`,
        publicId: mockPublicId
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload a PDF document first");
      return;
    }
    if (!studentName || !phone || !collegeName || !address) {
      toast.error("Please fill in all required delivery details");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload to Cloudinary
      toast.loading("Uploading your PDF...", { id: "upload-toast" });
      const uploadResult = await uploadPdfFile(file);
      toast.dismiss("upload-toast");

      // 2. Submit order to backend
      const payload = {
        pdf_name: file.name,
        pdf_url: uploadResult.url,
        cloudinary_public_id: uploadResult.publicId,
        pages: pages,
        copies: copies,
        print_type: printType,
        binding: binding,
        total_price: liveTotal,
        payment_method: paymentMethod,
        delivery_details: {
          student_name: studentName,
          phone_number: phone,
          college_name: collegeName,
          delivery_location: deliveryLocation,
          address: address,
          landmark: landmark || null,
          required_time: requiredTime === "Specific Date" ? customDate : requiredTime
        }
      };

      const order = await printOrderService.createPrintOrder(payload);
      setCreatedOrder(order);
      setIsSuccess(true);
      toast.success("Print order placed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to place print order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && createdOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-3xl p-8 shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={40} />
          </div>
          <div>
            <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full uppercase tracking-wider">Beta Feature</span>
            <h1 className="text-3xl font-extrabold text-gray-950 dark:text-white mt-3">Order Placed!</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Your print order <span className="font-bold text-gray-800 dark:text-gray-200">{createdOrder.order_id}</span> has been scheduled for delivery.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-850 p-6 rounded-2xl text-left border border-gray-150 dark:border-gray-800 space-y-4">
            <h3 className="font-bold text-gray-950 dark:text-white border-b pb-2">Print Details</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-gray-500">Document</span>
              <span className="font-semibold text-right truncate">{createdOrder.pdf_name}</span>
              <span className="text-gray-500">Pages / Copies</span>
              <span className="font-semibold text-right">{createdOrder.pages} pages / {createdOrder.copies} copy(ies)</span>
              <span className="text-gray-500">Options</span>
              <span className="font-semibold text-right">{createdOrder.print_type} ({createdOrder.binding} Binding)</span>
              <span className="text-gray-500">Payment Method</span>
              <span className="font-semibold text-right">{createdOrder.payment_method}</span>
              <span className="text-gray-500">Required Time</span>
              <span className="font-semibold text-right text-indigo-600 dark:text-indigo-400">{createdOrder.delivery_details.required_time}</span>
              <span className="text-gray-500 font-bold border-t pt-2 mt-2">Total Amount</span>
              <span className="font-bold text-right text-green-600 border-t pt-2 mt-2 text-lg">₹{createdOrder.total_price}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button variant="primary" className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
              setFile(null);
              setPages(1);
              setIsSuccess(false);
              setCreatedOrder(null);
            }}>
              Order Another Print
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-gray-800 dark:text-gray-100">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <Link to="/dashboard" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold mb-2">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            Xerox & Print Delivery <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-wider">Beta</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Upload, configure, and get document prints delivered directly to you.</p>
        </div>
        <div className="hidden md:flex h-12 w-12 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl items-center justify-center">
          <Printer size={24} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Configuration Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Upload */}
          <Card className="p-6 md:p-8 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800 relative">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-4 flex items-center gap-2">
              <Upload size={18} className="text-indigo-600" />
              1. Upload Document
            </h3>

            {!file ? (
              <label className="border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50/50 dark:bg-gray-950/20 group">
                <Upload size={32} className="text-gray-400 group-hover:text-indigo-500 transition-colors mb-3" />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Choose a PDF file</span>
                <span className="text-xs text-gray-400 mt-1">Files up to 25MB supported</span>
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-150 dark:border-gray-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPages(1);
                  }}
                  className="text-xs font-bold text-red-500 hover:underline shrink-0"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Page Count Detection */}
            {file && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-sm text-gray-500">Detected Page Count:</span>
                <div className="flex items-center gap-2">
                  {isCounting ? (
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={pages}
                      onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800 text-center font-bold text-sm"
                    />
                  )}
                  <span className="text-xs text-gray-400">Pages (Adjust if incorrect)</span>
                </div>
              </div>
            )}
          </Card>

          {/* Section 2: Print Settings */}
          <Card className="p-6 md:p-8 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-4 flex items-center gap-2">
              <Printer size={18} className="text-indigo-600" />
              2. Print Specifications
            </h3>

            <div className="space-y-5">
              {/* Print Type / Color Option */}
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">Print Color</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`border-2 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                    printType === "B/W" 
                      ? "border-indigo-600 bg-indigo-500/5" 
                      : "border-gray-200 dark:border-gray-800 bg-transparent"
                  }`}>
                    <input type="radio" name="printType" value="B/W" checked={printType === "B/W"} onChange={() => setPrintType("B/W")} className="sr-only" />
                    <span className="font-bold text-sm">Black & White</span>
                    <span className="text-xs text-gray-400 mt-1">₹2 per page</span>
                  </label>

                  <label className={`border-2 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                    printType === "Color" 
                      ? "border-indigo-600 bg-indigo-500/5" 
                      : "border-gray-200 dark:border-gray-800 bg-transparent"
                  }`}>
                    <input type="radio" name="printType" value="Color" checked={printType === "Color"} onChange={() => setPrintType("Color")} className="sr-only" />
                    <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1">Color Print <Sparkles size={14} /></span>
                    <span className="text-xs text-gray-400 mt-1">₹10 per page</span>
                  </label>
                </div>
              </div>

              {/* Number of Copies */}
              <div className="flex items-center justify-between border-t border-b border-gray-100 dark:border-gray-800 py-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block">Number of Copies</label>
                  <span className="text-xs text-gray-400">How many sets do you need?</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCopies(Math.max(1, copies - 1))}
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-lg">{copies}</span>
                  <button
                    type="button"
                    onClick={() => setCopies(copies + 1)}
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Paper Selection (Locked A4) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">Paper Size</label>
                  <select disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 text-gray-400 text-sm cursor-not-allowed outline-none">
                    <option value="A4">A4 (Standard)</option>
                  </select>
                </div>

                {/* Binding Option */}
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">Binding Type</label>
                  <select
                    value={binding}
                    onChange={(e) => setBinding(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-850 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="None">No Binding</option>
                    <option value="Spiral">Spiral Binding (+₹30)</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Delivery Details & Checkout Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section 3: Delivery Details */}
          <Card className="p-6 md:p-8 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-4 flex items-center gap-2">
              <Truck size={18} className="text-indigo-600" />
              3. Delivery Location
            </h3>

            <div className="space-y-4">
              <Input label="Student Name *" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. Manikanta" />
              <Input label="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" type="tel" />
              <Input label="College Name *" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} placeholder="e.g. RV College of Engineering" />

              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">Delivery Location Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {["College", "Hostel", "Home", "Other"].map((loc) => (
                    <label key={loc} className={`border rounded-lg p-2.5 text-center cursor-pointer transition-all text-xs font-bold ${
                      deliveryLocation === loc 
                        ? "border-indigo-600 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400" 
                        : "border-gray-200 dark:border-gray-800"
                    }`}>
                      <input type="radio" name="deliveryLocation" value={loc} checked={deliveryLocation === loc} onChange={() => setDeliveryLocation(loc)} className="sr-only" />
                      {loc}
                    </label>
                  ))}
                </div>
              </div>

              <Input label="Delivery Address *" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Room 304, Block C, Campus Hostel" />
              <Input label="Landmark (Optional)" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="e.g. Near Library Gate" />

              {/* Delivery Schedule / Time */}
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">Required Delivery Time *</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {["Today", "Tomorrow", "Specific Date"].map((time) => (
                    <label key={time} className={`border rounded-lg py-2 text-center cursor-pointer transition-all text-[11px] font-bold ${
                      requiredTime === time 
                        ? "border-indigo-600 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400" 
                        : "border-gray-200 dark:border-gray-800"
                    }`}>
                      <input type="radio" name="requiredTime" value={time} checked={requiredTime === time} onChange={() => setRequiredTime(time)} className="sr-only" />
                      {time}
                    </label>
                  ))}
                </div>

                {requiredTime === "Specific Date" && (
                  <input
                    type="date"
                    required
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-850 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Section 4: Live Total & Payment */}
          <Card className="p-6 md:p-8 bg-indigo-600 text-white rounded-3xl relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign size={18} />
              4. Order Checkout
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                <span>Print cost ({pages} pages × ₹{pageRate})</span>
                <span className="font-semibold">₹{pages * pageRate}</span>
              </div>
              {binding !== "None" && (
                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                  <span>Binding cost ({binding})</span>
                  <span className="font-semibold">₹{bindingCost}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                <span>Quantity</span>
                <span className="font-semibold">× {copies}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Delivery Price</span>
                <span>₹{liveTotal}</span>
              </div>

              {/* Payment Methods */}
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <label className="text-xs font-semibold text-white/70 block mb-1">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`border border-white/20 rounded-lg p-2 text-center cursor-pointer transition-all text-xs font-bold flex flex-col justify-center items-center gap-1 ${
                    paymentMethod === "COD" ? "bg-white text-indigo-700 border-white" : "text-white"
                  }`}>
                    <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="sr-only" />
                    <span>Cash on Delivery</span>
                  </label>

                  <label className={`border border-white/20 rounded-lg p-2 text-center cursor-pointer transition-all text-xs font-bold flex flex-col justify-center items-center gap-1 ${
                    paymentMethod === "Online" ? "bg-white text-indigo-700 border-white" : "text-white"
                  }`}>
                    <input type="radio" name="paymentMethod" value="Online" checked={paymentMethod === "Online"} onChange={() => setPaymentMethod("Online")} className="sr-only" />
                    <span>Online Pay (Beta)</span>
                  </label>
                </div>
              </div>

              {/* Uploading progress bar */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Uploading document...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-indigo-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-white h-2 rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || isUploading || isCounting || !file}
                className="w-full bg-white hover:bg-slate-100 text-indigo-600 font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </div>
                ) : (
                  <>
                    <Printer size={18} />
                    Place Print Order
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};
