import { motion } from "framer-motion";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export const Card = ({ children, className, hover = false, ...props }) => {
  const baseStyles = "bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden";
  const hoverStyles = hover ? "hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300" : "";

  return (
    <motion.div
      className={twMerge(clsx(baseStyles, hoverStyles, className))}
      {...props}
    >
      {children}
    </motion.div>
  );
};
