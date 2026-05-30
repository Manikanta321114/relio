import { motion } from "framer-motion";
import clsx from "clsx";
import { Clock, CheckCircle2, XCircle, Tag } from "lucide-react";

export const StatusBadge = ({ status }) => {
  const configs = {
    pending: {
      color: "text-amber-600 bg-amber-50 border-amber-200",
      icon: Clock,
      label: "Pending Review",
      glow: "bg-amber-400"
    },
    approved: {
      color: "text-green-600 bg-green-50 border-green-200",
      icon: CheckCircle2,
      label: "Approved",
      glow: "bg-green-400"
    },
    rejected: {
      color: "text-red-600 bg-red-50 border-red-200",
      icon: XCircle,
      label: "Rejected",
      glow: "bg-red-400"
    },
    sold: {
      color: "text-blue-600 bg-blue-50 border-blue-200",
      icon: Tag,
      label: "Sold",
      glow: "bg-blue-400"
    }
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <div className={clsx("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border", config.color)}>
      <div className="relative flex items-center justify-center mr-1.5">
        {status === "pending" && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={clsx("absolute w-full h-full rounded-full blur-[2px]", config.glow)}
          />
        )}
        <Icon size={12} className="relative z-10" />
      </div>
      {config.label}
    </div>
  );
};
