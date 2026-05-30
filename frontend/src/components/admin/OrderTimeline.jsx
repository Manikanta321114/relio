import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import clsx from "clsx";

const STAGES = [
  "interested",
  "seller_contacted",
  "collected",
  "packed",
  "shipped",
  "delivered"
];

export const OrderTimeline = ({ currentStatus }) => {
  const currentIndex = STAGES.indexOf(currentStatus);
  const isCancelled = currentStatus === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center text-red-500 font-medium py-2">
        <CheckCircle2 className="w-5 h-5 mr-2" />
        Order Cancelled
      </div>
    );
  }

  return (
    <div className="flex items-center w-full mt-2">
      {STAGES.map((stage, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none group relative">
            <motion.div
              initial={false}
              animate={{ 
                scale: isCurrent ? 1.2 : 1,
                color: isCompleted ? "#14532d" : "#cbd5e1" // primary vs slate-300
              }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className={clsx(
                "relative z-10 flex items-center justify-center bg-white rounded-full",
                isCompleted ? "text-primary" : "text-gray-300"
              )}
            >
              {isCompleted ? <CheckCircle2 className="w-5 h-5 bg-white" /> : <Circle className="w-5 h-5 bg-white" />}
              
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                {stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </motion.div>

            {index < STAGES.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 bg-gray-200 overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: isCompleted && index < currentIndex ? "100%" : "0%" }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
