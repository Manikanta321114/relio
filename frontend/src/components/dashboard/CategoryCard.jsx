import { motion } from "framer-motion";
import { Book, Code, Calculator, Atom, Heart, Stethoscope, Building2, BookOpen } from "lucide-react";
import clsx from "clsx";

const icons = {
  UPSC: Building2,
  SSC: Book,
  GATE: Calculator,
  NEET: Stethoscope,
  JEE: Atom,
  Novels: BookOpen,
  Poetry: Heart,
  Programming: Code,
};

export const CategoryCard = ({ title, colorClass, delay = 0 }) => {
  const Icon = icons[title] || Book;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative group cursor-pointer"
    >
      <div className={clsx(
        "absolute inset-0 bg-gradient-to-br rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300",
        colorClass
      )} />
      <div className="relative h-full p-6 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center space-y-3">
        <div className={clsx("p-3 rounded-xl bg-gradient-to-br bg-opacity-10", colorClass.replace('to-', 'to-opacity-10 '))}>
          <Icon size={28} className="text-gray-800" />
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
    </motion.div>
  );
};
