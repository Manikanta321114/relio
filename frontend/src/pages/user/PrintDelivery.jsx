import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, Truck, RefreshCw, CreditCard, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export const PrintDelivery = () => {
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState({
    colorMode: "bw", // bw, color
    binding: "spiral", // spiral, none, staple
    paperSize: "a4", // a4, letter
    copies: 1,
    pages: 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatePrice = () => {
    let perPagePrice = options.colorMode === "color" ? 5 : 1; // BW: ₹1, Color: ₹5
    let bindingPrice = 0;
    if (options.binding === "spiral") bindingPrice = 40;
    if (options.binding === "staple") bindingPrice = 5;

    return (options.pages * perPagePrice * options.copies) + bindingPrice;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast.error("Please upload a PDF file only.");
        return;
      }
      setFile(selectedFile);
      // Simulate reading page count
      setOptions(prev => ({ ...prev, pages: Math.floor(Math.random() * 60) + 5 }));
      toast.success(`Uploaded: ${selectedFile.name}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload a document to print.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Order Placed Successfully! (Demo)");
      setFile(null);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Print & Delivery Hub</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Upload your study materials, notes, or assignments and get professional printed copies delivered to your door.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings & Upload */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Card */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">1. Upload Document</h2>
            
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary rounded-2xl p-8 text-center transition-colors cursor-pointer relative">
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
                    <p className="text-xs text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB • {options.pages} pages detected</p>
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
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF documents only. Max size 50MB.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Card */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">2. Printing Options</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Color Mode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOptions(prev => ({ ...prev, colorMode: "bw" }))}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      options.colorMode === "bw"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    Black & White
                  </button>
                  <button
                    type="button"
                    onClick={() => setOptions(prev => ({ ...prev, colorMode: "color" }))}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      options.colorMode === "color"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    Color Print
                  </button>
                </div>
              </div>

              {/* Binding Option */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Binding Type</label>
                <select
                  value={options.binding}
                  onChange={(e) => setOptions(prev => ({ ...prev, binding: e.target.value }))}
                  className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary"
                >
                  <option value="none">No Binding (Loose Sheets)</option>
                  <option value="staple">Stapled</option>
                  <option value="spiral">Spiral Binding</option>
                </select>
              </div>

              {/* Paper Size */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Paper Size</label>
                <select
                  value={options.paperSize}
                  onChange={(e) => setOptions(prev => ({ ...prev, paperSize: e.target.value }))}
                  className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary"
                >
                  <option value="a4">A4 (Standard)</option>
                  <option value="letter">Letter</option>
                </select>
              </div>

              {/* Copies */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Number of Copies</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={options.copies <= 1}
                    onClick={() => setOptions(prev => ({ ...prev, copies: Math.max(1, prev.copies - 1) }))}
                    className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-gray-800 dark:text-gray-100">{options.copies}</span>
                  <button
                    type="button"
                    onClick={() => setOptions(prev => ({ ...prev, copies: prev.copies + 1 }))}
                    className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price & Summary */}
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6 sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Summary</h2>

            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex justify-between">
                <span>Pages per copy</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{options.pages}</span>
              </div>
              <div className="flex justify-between">
                <span>Copies</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{options.copies}</span>
              </div>
              <div className="flex justify-between">
                <span>Color mode</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{options.colorMode === "color" ? "Color Print" : "Black & White"}</span>
              </div>
              <div className="flex justify-between">
                <span>Binding</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{options.binding}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800 dark:text-gray-200">Total Price</span>
              <span className="text-2xl font-bold text-primary">₹{calculatePrice()}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Order Print
                </>
              )}
            </button>

            <div className="pt-2 text-xs text-gray-400 text-center flex items-center justify-center gap-1.5">
              <Truck size={14} className="text-primary" /> Delivery in 2-3 business days.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
