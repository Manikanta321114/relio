import api from "./api";

export const userService = {
  getProfileData: async () => {
    const response = await api.get("/users/profile-data");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/users/profile", data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put("/users/change-password", data);
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await api.post("/users/addresses", addressData);
    return response.data;
  },

  editAddress: async (addressId, addressData) => {
    const response = await api.put(`/users/addresses/${addressId}`, addressData);
    return response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await api.delete(`/users/addresses/${addressId}`);
    return response.data;
  },

  updateNotificationSettings: async (settings) => {
    const response = await api.put("/users/notification-settings", settings);
    return response.data;
  }
};
