/**
 * Cloudinary Upload Helper Service
 * Handles uploading images from the frontend to Cloudinary.
 * 
 * NOTE: For a real production app, you typically want to request a signed upload signature 
 * from your backend, or use an unsigned upload preset.
 */
import axios from "axios";

// Read from env, but provide a safe fallback for the UI demo if missing
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "demo_preset";

export const uploadImageToCloudinary = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return {
      success: true,
      url: response.data.secure_url,
      publicId: response.data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error.response?.data || error);
    return {
      success: false,
      error: error.message,
    };
  }
};
