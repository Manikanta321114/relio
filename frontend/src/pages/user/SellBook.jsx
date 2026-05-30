import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadZone } from "../../components/upload/UploadZone";
import { StepIndicator } from "../../components/forms/StepIndicator";
import { ConditionSelector } from "../../components/selectors/ConditionSelector";
import { PriceInput } from "../../components/forms/PriceInput";
import { SuccessState } from "../../components/ui/SuccessState";
import { UploadProgress } from "../../components/ui/UploadProgress";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import toast from "react-hot-toast";
import { uploadImageToCloudinary } from "../../services/cloudinary";
import { bookService } from "../../services/bookService";
import { useNavigate } from "react-router-dom";
import { getCurrentLocation } from "../../utils/location";

const STEPS = ["Images", "Details", "Location", "Preview"];
const CATEGORIES = ["UPSC", "SSC", "GATE", "NEET", "JEE", "Novels", "Poetry", "Programming", "Self Help"];

export const SellBook = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Upload States
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  const [formData, setFormData] = useState({
    images: { front: null, back: null },
    title: "",
    category: "",
    condition: "",
    price: "",
    description: "",
    address: { state: "", city: "", area: "", pincode: "" }
  });

  const handleUseCurrentLocation = async () => {
    setIsDetecting(true);
    try {
      const locationData = await getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        address: {
          state: locationData.state,
          city: locationData.city,
          area: locationData.area,
          pincode: locationData.pincode
        }
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

  const handleFileSelect = (file, type) => {
    setFormData(prev => ({
      ...prev,
      images: { ...prev.images, [type]: file }
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["state", "city", "area", "pincode"].includes(name)) {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.images.front) {
        toast.error("Front image is required");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.title || !formData.category || !formData.condition || !formData.price || !formData.description) {
        toast.error("Please fill all book details");
        return;
      }
    }
    if (currentStep === 3) {
      if (!formData.address.state || !formData.address.city || !formData.address.area || !formData.address.pincode) {
        toast.error("Please fill your complete address");
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // 1. Upload Front Image
      setUploadStatus("Uploading front cover...");
      setUploadProgress(10);
      const frontUpload = await uploadImageToCloudinary(formData.images.front, (prog) => {
        setUploadProgress(10 + (prog * 0.4)); // First 40% of progress
      });
      
      if (!frontUpload.success) throw new Error("Failed to upload front image");

      // 2. Upload Back Image (if exists)
      let backUrl = null;
      if (formData.images.back) {
        setUploadStatus("Uploading back cover...");
        const backUpload = await uploadImageToCloudinary(formData.images.back, (prog) => {
          setUploadProgress(50 + (prog * 0.4)); // Next 40% of progress
        });
        if (!backUpload.success) throw new Error("Failed to upload back image");
        backUrl = backUpload.url;
      }

      // 3. Save to Backend
      setUploadStatus("Saving listing...");
      setUploadProgress(95);

      const payload = {
        title: formData.title,
        category: formData.category,
        condition: formData.condition,
        price: Number(formData.price),
        description: formData.description,
        front_image: frontUpload.url,
        back_image: backUrl,
        location: formData.address
      };

      await bookService.createBook(payload);
      
      setUploadProgress(100);
      setUploadStatus("Done!");
      
      // Short delay so user sees 100%
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 500);

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to submit book");
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <UploadZone label="Front Cover Image (Required)" id="front" currentFile={formData.images.front} onFileSelect={handleFileSelect} />
            <UploadZone label="Back Cover Image (Optional)" id="back" currentFile={formData.images.back} onFileSelect={handleFileSelect} />
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <Input label="Book Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Atomic Habits" />
            <div>
              <label className="text-sm font-medium text-text/80 mb-2 block">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 outline-none">
                <option value="" disabled>Select Category</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <ConditionSelector selected={formData.condition} onChange={(val) => setFormData(prev => ({ ...prev, condition: val }))} />
            <PriceInput label="Expected Price" name="price" value={formData.price} onChange={handleChange} placeholder="0" />
            <div>
              <label className="text-sm font-medium text-text/80 mb-2 block">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none" placeholder="Mention any specific details..." />
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl mb-4 text-sm text-primary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start">
                <span className="font-semibold mr-2">Pickup Location:</span> Tell us where our executive should collect the book.
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

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="State" name="state" value={formData.address.state} onChange={handleChange} placeholder="e.g. Maharashtra" />
                <Input label="City" name="city" value={formData.address.city} onChange={handleChange} placeholder="e.g. Mumbai" />
              </div>
              <Input label="Area" name="area" value={formData.address.area} onChange={handleChange} placeholder="e.g. Andheri West" />
              <Input label="Pincode" name="pincode" value={formData.address.pincode} onChange={handleChange} placeholder="e.g. 400053" />
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Preview Details</h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="text-gray-500">Title</div>
                <div className="font-medium text-gray-900 text-right">{formData.title}</div>
                <div className="text-gray-500">Category</div>
                <div className="font-medium text-gray-900 text-right">{formData.category}</div>
                <div className="text-gray-500">Condition</div>
                <div className="font-medium text-gray-900 text-right">{formData.condition}</div>
                <div className="text-gray-500">Price</div>
                <div className="font-medium text-green-600 text-right text-lg">₹{formData.price}</div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (isSuccess) {
    return (
      <div className="py-10 flex justify-center">
        <SuccessState 
          title="Book Submitted Successfully!" 
          message="Your book has been submitted for admin approval 🚀. We will notify you once it's live."
        />
        {/* Note: The SuccessState currently redirects to /dashboard. Let's update it to /my-uploads later or just here */}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Sell a Book</h1>
        <p className="text-gray-500 mt-2">Upload your old book and give it a new life.</p>
      </div>

      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <Card className="p-6 md:p-8 relative overflow-visible">
        {isSubmitting ? (
          <div className="min-h-[400px] flex items-center justify-center">
             <UploadProgress progress={uploadProgress} statusText={uploadStatus} />
          </div>
        ) : (
          <>
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>
            </div>

            <div className="mt-8 flex justify-between pt-6 border-t border-gray-100">
              <Button variant="ghost" onClick={prevStep} disabled={currentStep === 1} className={currentStep === 1 ? "opacity-0 pointer-events-none" : ""}>Back</Button>
              {currentStep < STEPS.length ? (
                <Button variant="primary" onClick={nextStep} className="px-8">Continue</Button>
              ) : (
                <Button variant="primary" onClick={handleSubmit} className="px-8 bg-green-600 hover:bg-green-700">Submit for Approval</Button>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
