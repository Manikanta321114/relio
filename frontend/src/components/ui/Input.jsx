import { forwardRef, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff } from "lucide-react";

export const Input = forwardRef(
  ({ label, error, className, type = "text", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    const baseInputStyles =
      "w-full px-4 py-3 rounded-lg border bg-white/50 backdrop-blur-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-400";
    
    const borderStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
      : "border-gray-200 focus:border-primary";

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-text/80">{label}</label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={currentType}
            className={twMerge(clsx(baseInputStyles, borderStyles, className))}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <span className="text-xs text-red-500 font-medium animate-pulse">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
