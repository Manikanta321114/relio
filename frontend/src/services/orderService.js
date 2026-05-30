import api from "./api";

export const orderService = {
  createCheckoutOrder: async (bookId, shippingAddress, paymentMethod = "COD") => {
    const response = await api.post("/orders/checkout", { 
      book_id: bookId, 
      shipping_address: shippingAddress,
      payment_method: paymentMethod 
    });
    return response.data;
  },
  getMyOrders: async () => {
    const response = await api.get("/orders/my-orders");
    return response.data;
  },
  cancelOrder: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/cancel`);
    return response.data;
  }
};

