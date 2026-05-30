import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import toast from "react-hot-toast";
import { getCurrentLocation } from "../../utils/location";

export const Register = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: {
      state: "",
      city: "",
      area: "",
      pincode: ""
    }
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

  const handleNext = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill all fields in this step");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.address.state || !formData.address.city || !formData.address.area || !formData.address.pincode) {
      toast.error("Please fill out your complete address");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address
      };
      
      await register(payload);
      toast.success("Account created successfully!");
      
      // Auto login after register
      const authData = await login(formData.email, formData.password);
      if (authData.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
      
    } catch (error) {
      toast.error(error.detail || error.response?.data?.detail || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background py-10">
      {/* Background Orbs */}
      <div className="absolute top-[10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-secondary/10 blur-[150px] mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/10 blur-[150px] mix-blend-multiply pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg p-4 relative z-10"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Join RELIO</h1>
            <p className="text-gray-500 font-medium">
              {step === 1 ? "Create your account" : "Add your location"}
            </p>
          </div>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <Input label="Full Name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Email" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} />
                    <Input label="Phone Number" name="phone" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} />
                  </div>
                  <Input label="Password" name="password" type="password" placeholder="Create a strong password" value={formData.password} onChange={handleChange} />
                  <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} />
                  
                  <Button type="submit" fullWidth className="mt-6">Next Step</Button>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl mb-4 text-sm text-primary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start">
                      <span className="font-semibold mr-2">Tip:</span> We need this to verify nearby books and manage shipping.
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="State" name="state" placeholder="e.g. Maharashtra" value={formData.address.state} onChange={handleChange} />
                    <Input label="City" name="city" placeholder="e.g. Mumbai" value={formData.address.city} onChange={handleChange} />
                  </div>
                  <Input label="Area / Locality" name="area" placeholder="e.g. Andheri West" value={formData.address.area} onChange={handleChange} />
                  <Input label="Pincode" name="pincode" placeholder="e.g. 400053" value={formData.address.pincode} onChange={handleChange} />
                  
                  <div className="flex space-x-3 mt-6">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3">
                      Back
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="w-2/3">
                      Complete Registration
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-secondary transition-colors">
              Sign In
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};
