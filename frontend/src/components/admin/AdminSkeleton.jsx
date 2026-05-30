import { motion } from "framer-motion";

export const AdminSkeleton = ({ type = "card", count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className={
            type === "card"
              ? "bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4"
              : "bg-white p-4 rounded-xl border border-gray-100 flex items-center space-x-4 mb-2"
          }
        >
          {type === "card" ? (
            <>
              <div className="w-full h-48 bg-gray-100 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
              <div className="flex space-x-2 pt-2">
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-full" />
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-full" />
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
              </div>
              <div className="w-24 h-8 bg-gray-100 rounded animate-pulse" />
            </>
          )}
        </motion.div>
      ))}
    </>
  );
};
