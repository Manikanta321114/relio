import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, X, Camera, Image as GalleryIcon, Trash2 } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { Button } from "../ui/Button";

export const UploadZone = ({ onFileSelect, label, id, currentFile }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const validateAndSelectFile = (file) => {
    if (!file) return;

    // Validate type (JPG, JPEG, PNG)
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid format. Please upload a JPG, JPEG, or PNG image.");
      return;
    }

    // Validate size (max 10 MB)
    const maxSize = 10 * 1024 * 1024; // 10 MB in bytes
    if (file.size > maxSize) {
      toast.error("File is too large. Maximum size allowed is 10 MB.");
      return;
    }

    onFileSelect(file, id);
  };

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-text/80 mb-2">{label}</p>
      
      {/* Hidden File Inputs for Mobile Integration */}
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        ref={galleryInputRef}
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        capture="environment"
        ref={cameraInputRef}
        style={{ display: "none" }}
        onChange={handleChange}
      />

      {!currentFile ? (
        <div className="space-y-3">
          {/* Desktop/Tablet Drag & Drop Zone */}
          <motion.div
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={clsx(
              "relative w-full h-48 rounded-2xl border-2 border-dashed flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors bg-white/50 backdrop-blur-sm hidden md:flex",
              isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
            )}
          >
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleChange}
            />
            
            <motion.div 
              animate={{ y: isDragActive ? -5 : 0, scale: isDragActive ? 1.05 : 1 }}
              className="flex flex-col items-center justify-center p-6 text-center z-0 pointer-events-none"
            >
              <div className={clsx(
                "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                isDragActive ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-400"
              )}>
                <UploadCloud size={32} />
              </div>
              <p className="text-base font-semibold text-gray-700">Click or drag image here</p>
              <p className="text-sm text-gray-400 mt-1">PNG, JPG or JPEG (max. 10MB)</p>
            </motion.div>
          </motion.div>

          {/* Mobile Buttons Layout */}
          <div className="flex md:hidden flex-col gap-3 w-full">
            <Button
              type="button"
              variant="primary"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 text-base font-bold bg-primary hover:bg-primary-dark shadow-md"
            >
              <Camera size={20} />
              Take Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => galleryInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 text-base font-bold border-gray-250 text-gray-700 bg-white/80 hover:bg-gray-50"
            >
              <GalleryIcon size={20} />
              Choose From Gallery
            </Button>
            <p className="text-[10px] text-gray-400 text-center">Supports JPG, JPEG, or PNG up to 10 MB.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <ImagePreviewCard file={currentFile} onRemove={() => onFileSelect(null, id)} />
          
          {/* Action Row for Mobile Retaking/Swapping */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 min-w-[100px] text-xs py-2 flex items-center justify-center gap-1.5 font-bold border-gray-200"
            >
              <Camera size={14} />
              Retake Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => galleryInputRef.current?.click()}
              className="flex-1 min-w-[100px] text-xs py-2 flex items-center justify-center gap-1.5 font-bold border-gray-200"
            >
              <GalleryIcon size={14} />
              Gallery
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onFileSelect(null, id)}
              className="text-xs py-2 px-3 font-bold flex items-center justify-center gap-1.5 hover:bg-red-600"
            >
              <Trash2 size={14} />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const ImagePreviewCard = ({ file, onRemove }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (file && typeof file !== "string") {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const displayUrl = typeof file === "string" ? file : previewUrl;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative w-full h-48 rounded-2xl overflow-hidden group border border-gray-150 shadow-sm"
    >
      {displayUrl ? (
        <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse">
          <ImageIcon size={40} className="text-gray-300" />
        </div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          onClick={(e) => { e.preventDefault(); onRemove(); }}
          className="p-3 bg-white text-red-500 rounded-full hover:bg-red-50 hover:scale-110 transition-transform shadow-lg"
        >
          <X size={20} />
        </button>
      </div>
    </motion.div>
  );
};
