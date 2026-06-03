import api from "./api";

export const printOrderService = {
  checkout: async (orderData) => {
    const response = await api.post("/print-orders/checkout", orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get("/print-orders/my-orders");
    return response.data;
  }
};
