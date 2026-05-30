import api from "./api";

export const adminService = {
  getStats: async () => {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  },
  
  getPendingBooks: async () => {
    const response = await api.get("/admin/books/pending");
    return response.data;
  },
  
  approveBook: async (id, adminPrice, adjustmentReason = null, negotiable = false) => {
    const response = await api.put(`/admin/books/${id}/approve`, { 
      admin_price: adminPrice,
      adjustment_reason: adjustmentReason,
      negotiable: negotiable
    });
    return response.data;
  },
  
  rejectBook: async (id) => {
    const response = await api.put(`/admin/books/${id}/reject`);
    return response.data;
  },
  
  getOrders: async (status, search) => {
    let url = "/admin/orders?";
    if (status) url += `status=${status}&`;
    if (search) url += `search=${search}`;
    const response = await api.get(url);
    return response.data;
  },
  
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },
  
  updateOrderPricing: async (id, pricingData) => {
    const response = await api.put(`/admin/orders/${id}/pricing`, pricingData);
    return response.data;
  },
  
  updateProfile: async (data) => {
    const response = await api.put("/admin/profile", data);
    return response.data;
  },
  
  changePassword: async (data) => {
    const response = await api.put("/admin/change-password", data);
    return response.data;
  }
};
