import { motion } from "framer-motion";

export const SkeletonBookCard = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm w-full animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-2" />
        <div className="pt-2 grid grid-cols-2 gap-2">
          <div className="h-9 bg-gray-200 rounded-lg" />
          <div className="h-9 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
