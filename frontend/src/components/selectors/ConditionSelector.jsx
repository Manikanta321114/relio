import { motion } from "framer-motion";
import clsx from "clsx";

const conditions = [
  { id: "Like New", desc: "No missing pages, no highlights, looks brand new" },
  { id: "Good", desc: "Minor wear, clean pages, slight cover creases" },
  { id: "Average", desc: "Noticeable wear, some highlights or notes" },
  { id: "Old", desc: "Heavy wear, yellow pages, well used but readable" }
];

export const ConditionSelector = ({ selected, onChange }) => {
  return (
    <div className="w-full">
      <label className="text-sm font-medium text-text/80 mb-2 block">Book Condition</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {conditions.map((cond) => {
          const isSelected = selected === cond.id;
          return (
            <motion.div
              key={cond.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(cond.id)}
              className={clsx(
                "relative p-4 rounded-xl border-2 cursor-pointer transition-all overflow-hidden bg-white/50 backdrop-blur-sm",
                isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-gray-200 hover:border-primary/50"
              )}
            >
              {/* Active Indicator Glow */}
              {isSelected && (
                <motion.div
                  layoutId="condition-active"
                  className="absolute inset-0 bg-primary/5 z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <span className={clsx("font-semibold", isSelected ? "text-primary" : "text-gray-800")}>
                    {cond.id}
                  </span>
                  <div className={clsx(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected ? "border-primary" : "border-gray-300"
                  )}>
                    {isSelected && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                </div>
                <p className="text-xs text-gray-500">{cond.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
