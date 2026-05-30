import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, MapPin, BellRing, ChartPie, Trash2, Edit3, Plus, Save, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { userService } from "../../services/userService";
import { Button } from "../../components/ui/Button";
import { getCurrentLocation } from "../../utils/location";

export const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [hasError, setHasError] = useState(false);

  // States with strict defensive defaults
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [stats, setStats] = useState({ books_uploaded: 0, orders_placed: 0, orders_delivered: 0 });
  const [notificationSettings, setNotificationSettings] = useState({ order_updates: true, delivery_updates: true, email_notifications: true });
  const [addresses, setAddresses] = useState([]);
  
  // Password state
  const [passwords, setPasswords] = useState({ current_password: "", new_password: "", confirm_password: "" });

  // Address Modal State
  const [addressModal, setAddressModal] = useState(null); // 'add' or { ...address }
  const [addressForm, setAddressForm] = useState({
    full_name: "", phone: "", alt_phone: "", house_no: "", street: "", area: "", landmark: "", city: "", state: "", pincode: ""
  });

  const handleUseCurrentLocation = async () => {
    setIsDetecting(true);
    try {
      const locationData = await getCurrentLocation();
      setAddressForm(prev => ({
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

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const data = await userService.getProfileData();
      
      // Strict null safety defensive fallbacks
      setProfile(data?.profile || { name: "", email: "", phone: "" });
      setStats(data?.stats || { books_uploaded: 0, orders_placed: 0, orders_delivered: 0 });
      setNotificationSettings(data?.notification_settings || { order_updates: true, delivery_updates: true, email_notifications: true });
      setAddresses(data?.addresses || []);
    } catch (error) {
      console.error(error);
      setHasError(true);
      toast.error("Failed to load user settings data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile?.name?.trim() || !profile?.email?.trim() || !profile?.phone?.trim()) {
      toast.error("All profile fields are required");
      return;
    }
    setIsSaving(true);
    try {
      await userService.updateProfile(profile);
      toast.success("Profile changes saved successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!passwords.current_password || !passwords.new_password || !passwords.confirm_password) {
      toast.error("All password fields are required");
      return;
    }
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }
    setIsSaving(true);
    try {
      await userService.changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password
      });
      toast.success("Password updated successfully!");
      setPasswords({ current_password: "", new_password: "", confirm_password: "" });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddressAction = async (e) => {
    e.preventDefault();
    const required = ["full_name", "phone", "house_no", "street", "area", "city", "state", "pincode"];
    for (const field of required) {
      if (!addressForm[field]?.trim()) {
        toast.error(`Please fill in all required fields.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      if (addressModal === "add") {
        const response = await userService.addAddress(addressForm);
        setAddresses(response?.addresses || []);
        toast.success("New address added!");
      } else {
        const response = await userService.editAddress(addressModal.id, addressForm);
        setAddresses(response?.addresses || []);
        toast.success("Address updated!");
      }
      setAddressModal(null);
    } catch (error) {
      toast.error("Failed to save address details");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const response = await userService.deleteAddress(addressId);
      setAddresses(response?.addresses || []);
      toast.success("Address deleted successfully");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const openAddressModal = (type, addr = null) => {
    setAddressModal(type);
    if (addr) {
      setAddressForm({ ...addr });
    } else {
      setAddressForm({
        full_name: "", phone: "", alt_phone: "", house_no: "", street: "", area: "", landmark: "", city: "", state: "", pincode: ""
      });
    }
  };

  const toggleNotificationSetting = async (key) => {
    const currentVal = notificationSettings?.[key] ?? true;
    const updated = { ...notificationSettings, [key]: !currentVal };
    setNotificationSettings(updated);
    try {
      await userService.updateNotificationSettings(updated);
      toast.success("Preferences updated");
    } catch (error) {
      toast.error("Failed to update preferences");
    }
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "addresses", label: "Address Book", icon: MapPin },
    { id: "notifications", label: "Notification Settings", icon: BellRing },
    { id: "security", label: "Security & Password", icon: Lock },
    { id: "summary", label: "Account Summary", icon: ChartPie }
  ];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-4 col-span-1">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>)}
          </div>
          <div className="col-span-3 h-96 bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load Settings</h3>
        <p className="text-gray-500 mb-6">We encountered an unexpected error fetching your settings. Please try again.</p>
        <Button variant="primary" onClick={fetchProfileData}>Retry Loading</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Account Settings <Sparkles className="text-primary" size={24} />
          </h1>
          <p className="text-gray-500 mt-2">Manage your personal profile, secure credentials, and delivery destinations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="flex flex-col gap-2 col-span-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-medium transition-all duration-200 ${
                  isSelected 
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-102"
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="col-span-1 md:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 pb-4 border-b border-gray-50">
                  <User className="text-primary" /> Personal Profile Information
                </h2>
                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        value={profile?.name || ""} 
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" 
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        value={profile?.email || ""} 
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" 
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                      <input 
                        type="tel" 
                        value={profile?.phone || ""} 
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" 
                        placeholder="10-digit primary number"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button variant="primary" disabled={isSaving} type="submit" className="px-6 py-3 font-semibold flex items-center gap-2">
                      <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 pb-4 border-b border-gray-50">
                  <Lock className="text-primary" /> Update Password Credentials
                </h2>
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                      <input 
                        type="password" 
                        value={passwords.current_password} 
                        onChange={(e) => setPasswords(prev => ({ ...prev, current_password: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" 
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                      <input 
                        type="password" 
                        value={passwords.new_password} 
                        onChange={(e) => setPasswords(prev => ({ ...prev, new_password: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" 
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={passwords.confirm_password} 
                        onChange={(e) => setPasswords(prev => ({ ...prev, confirm_password: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-gray-50/50" 
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button variant="primary" disabled={isSaving} type="submit" className="px-6 py-3 font-semibold">
                      {isSaving ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "addresses" && (
              <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="text-primary" /> Delivery Address Book
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => openAddressModal("add")} className="flex items-center gap-1">
                    <Plus size={16} /> Add Address
                  </Button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-250 flex flex-col items-center">
                    <MapPin className="text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500 font-medium">No saved addresses found.</p>
                    <p className="text-xs text-gray-400 mt-1">Add your shipping addresses for rapid one-click checkout.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-200 relative group">
                        <p className="font-bold text-gray-800">{addr.full_name}</p>
                        <p className="text-sm text-gray-500 mt-2">{addr.house_no}, {addr.street}</p>
                        <p className="text-sm text-gray-500">{addr.area}, {addr.landmark && `(${addr.landmark})`}</p>
                        <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-sm text-gray-700 mt-3 font-semibold flex items-center gap-1">Phone: {addr.phone}</p>
                        
                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                          <button 
                            onClick={() => openAddressModal(addr, addr)} 
                            className="p-2 hover:bg-blue-50 text-blue-500 hover:text-blue-700 rounded-lg transition-colors"
                            title="Edit Address"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteAddress(addr.id)} 
                            className="p-2 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors"
                            title="Delete Address"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 pb-4 border-b border-gray-50">
                  <BellRing className="text-primary" /> Notification Settings & Alerts
                </h2>
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 border border-gray-50 rounded-2xl hover:bg-gray-50/50 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-800 text-base">Order Updates</h4>
                      <p className="text-sm text-gray-400 mt-0.5">Receive immediate notifications on successful checkout and tracking transitions.</p>
                    </div>
                    <button onClick={() => toggleNotificationSetting("order_updates")} className="text-primary hover:scale-105 transition-transform">
                      {(notificationSettings?.order_updates ?? true) ? <ToggleRight size={44} className="text-green-500" /> : <ToggleLeft size={44} className="text-gray-300" />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-4 border border-gray-50 rounded-2xl hover:bg-gray-50/50 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-800 text-base">Delivery Alerts</h4>
                      <p className="text-sm text-gray-400 mt-0.5">Alerts when packages are out for delivery, shipped, or successfully arrived.</p>
                    </div>
                    <button onClick={() => toggleNotificationSetting("delivery_updates")} className="text-primary hover:scale-105 transition-transform">
                      {(notificationSettings?.delivery_updates ?? true) ? <ToggleRight size={44} className="text-green-500" /> : <ToggleLeft size={44} className="text-gray-300" />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-4 border border-gray-50 rounded-2xl hover:bg-gray-50/50 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-800 text-base">Email Updates & Promotions</h4>
                      <p className="text-sm text-gray-400 mt-0.5">Receive promotional news, newsletter catalogs, and transactions directly in inbox.</p>
                    </div>
                    <button onClick={() => toggleNotificationSetting("email_notifications")} className="text-primary hover:scale-105 transition-transform">
                      {(notificationSettings?.email_notifications ?? true) ? <ToggleRight size={44} className="text-green-500" /> : <ToggleLeft size={44} className="text-gray-300" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "summary" && (
              <motion.div key="summary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 pb-4 border-b border-gray-50">
                  <ChartPie className="text-primary" /> Relio Account Summary Stats
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 bg-blue-50/40 border border-blue-100/50 rounded-3xl text-center">
                    <span className="text-3xl font-extrabold text-blue-600 block">{stats?.books_uploaded ?? 0}</span>
                    <span className="text-sm font-semibold text-gray-600 mt-2 block">Books Uploaded</span>
                  </div>
                  <div className="p-6 bg-orange-50/40 border border-orange-100/50 rounded-3xl text-center">
                    <span className="text-3xl font-extrabold text-orange-600 block">{stats?.orders_placed ?? 0}</span>
                    <span className="text-sm font-semibold text-gray-600 mt-2 block">Orders Placed</span>
                  </div>
                  <div className="p-6 bg-green-50/40 border border-green-100/50 rounded-3xl text-center">
                    <span className="text-3xl font-extrabold text-green-600 block">{stats?.orders_delivered ?? 0}</span>
                    <span className="text-sm font-semibold text-gray-600 mt-2 block">Orders Delivered</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ADDRESS FORM MODAL */}
      <AnimatePresence>
        {addressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-8 border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">{addressModal === "add" ? "Add New Shipping Address" : "Edit Shipping Address"}</h3>
                <button 
                  onClick={() => setAddressModal(null)} 
                  className="text-gray-400 hover:text-gray-600 p-1 bg-white hover:bg-gray-100 rounded-full border border-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddressAction} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl mb-4 text-sm text-primary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start">
                    <span className="font-semibold mr-2">Address Auto-fill:</span> Populate shipping fields with your current location.
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
                    ) : "📍 Detect Current Location"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={addressForm.full_name} 
                      onChange={(e) => setAddressForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                      placeholder="Receiver Name" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number *</label>
                    <input 
                      type="tel" 
                      required
                      value={addressForm.phone} 
                      onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                      placeholder="10-digit number" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pincode *</label>
                    <input 
                      type="text" 
                      required
                      value={addressForm.pincode} 
                      onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                      placeholder="6-digit pincode" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                    <input 
                      type="text" 
                      required
                      value={addressForm.city} 
                      onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                      placeholder="City Name" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                    <input 
                      type="text" 
                      required
                      value={addressForm.state} 
                      onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                      placeholder="State Name" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">House / Flat No., Building Name *</label>
                    <input 
                      type="text" 
                      required
                      value={addressForm.house_no} 
                      onChange={(e) => setAddressForm(prev => ({ ...prev, house_no: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                      placeholder="House No." 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Street Address *</label>
                    <input 
                      type="text" 
                      required
                      value={addressForm.street} 
                      onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                      placeholder="Street / Lane" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Area / Locality *</label>
                    <input 
                      type="text" 
                      required
                      value={addressForm.area} 
                      onChange={(e) => setAddressForm(prev => ({ ...prev, area: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                      placeholder="Area Name" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Landmark (Optional)</label>
                    <input 
                      type="text" 
                      value={addressForm.landmark} 
                      onChange={(e) => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                      placeholder="e.g. Near Hub Center" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Alternate Phone Number (Optional)</label>
                    <input 
                      type="tel" 
                      value={addressForm.alt_phone} 
                      onChange={(e) => setAddressForm(prev => ({ ...prev, alt_phone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                      placeholder="Alternative mobile number" 
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button variant="outline" type="button" onClick={() => setAddressModal(null)}>Cancel</Button>
                  <Button variant="primary" disabled={isSaving} type="submit">{isSaving ? "Saving..." : "Save Address"}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
