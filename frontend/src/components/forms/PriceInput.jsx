import { forwardRef } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export const PriceInput = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && <label className="text-sm font-medium text-text/80">{label}</label>}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-gray-500 font-semibold">₹</span>
        </div>
        <input
          ref={ref}
          type="number"
          min="0"
          step="1"
          className={twMerge(
            clsx(
              "w-full pl-8 pr-4 py-3 rounded-lg border bg-white/50 backdrop-blur-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-400 font-medium",
              error ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" : "border-gray-200 focus:border-primary",
              className
            )
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 font-medium animate-pulse">{error}</span>}
    </div>
  );
});

PriceInput.displayName = "PriceInput";
