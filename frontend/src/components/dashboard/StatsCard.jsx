import { motion } from "framer-motion";
import clsx from "clsx";

export const StatsCard = ({ title, value, icon: Icon, trend, colorClass, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="p-6 bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    >
      <div className={clsx(
        "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500",
        colorClass
      )} />
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h4 className="text-3xl font-bold text-gray-900">{value}</h4>
          {trend && (
            <p className="text-xs font-medium text-green-500 mt-2 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {trend}
            </p>
          )}
        </div>
        <div className={clsx("p-3 rounded-xl", colorClass.replace('bg-', 'bg-opacity-10 text-'))}>
          <Icon size={24} className={clsx(colorClass.replace('bg-', 'text-'))} />
        </div>
      </div>
    </motion.div>
  );
};
