import api from "./api";

export const printOrderService = {
  createPrintOrder: async (orderData) => {
    const response = await api.post("/print-orders/", orderData);
    return response.data;
  },
  getMyPrintOrders: async () => {
    const response = await api.get("/print-orders/my-orders");
    return response.data;
  },
  cancelPrintOrder: async (orderId) => {
    const response = await api.post(`/print-orders/${orderId}/cancel`);
    return response.data;
  },
  getAllPrintOrders: async () => {
    const response = await api.get("/print-orders/admin/all");
    return response.data;
  },
  updatePrintOrderStatus: async (orderId, status, adminNotes = "") => {
    const response = await api.put(`/print-orders/admin/${orderId}/status`, {
      status,
      admin_notes: adminNotes
    });
    return response.data;
  }
};
