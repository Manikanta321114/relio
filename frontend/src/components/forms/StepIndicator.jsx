import { motion } from "framer-motion";
import { Check } from "lucide-react";
import clsx from "clsx";

export const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-4 mb-8">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full" />
        
        {/* Active Progress Line */}
        <motion.div 
          className="absolute left-0 top-1/2 h-1 bg-primary -translate-y-1/2 z-0 rounded-full origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: (currentStep - 1) / (steps.length - 1) }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />

        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          
          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isCurrent ? "#1b3a32" : "#ffffff",
                  borderColor: isCompleted || isCurrent ? "#1b3a32" : "#e5e7eb",
                  color: isCompleted || isCurrent ? "#ffffff" : "#9ca3af",
                  scale: isCurrent ? 1.1 : 1
                }}
                className={clsx(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-colors duration-300 shadow-sm",
                  isCurrent && "ring-4 ring-primary/20"
                )}
              >
                {isCompleted ? <Check size={18} className="text-white" /> : stepNum}
              </motion.div>
              <span className={clsx(
                "absolute -bottom-6 text-xs font-medium whitespace-nowrap transition-colors duration-300",
                isCurrent ? "text-primary" : (isCompleted ? "text-gray-700" : "text-gray-400")
              )}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
