import { useState } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, BookOpen, Users, Package } from "lucide-react";
import { CategoryCard } from "../../components/dashboard/CategoryCard";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { BookCard } from "../../components/dashboard/BookCard";
import { RentModal } from "../../components/modals/RentModal";
import { useAuth } from "../../context/AuthContext";

// Mock Data for UI
const mockCategories = [
  { title: "UPSC", color: "from-blue-500/20 to-cyan-500/20 text-blue-600 bg-blue-50" },
  { title: "SSC", color: "from-purple-500/20 to-pink-500/20 text-purple-600 bg-purple-50" },
  { title: "GATE", color: "from-orange-500/20 to-red-500/20 text-orange-600 bg-orange-50" },
  { title: "NEET", color: "from-green-500/20 to-emerald-500/20 text-green-600 bg-green-50" },
  { title: "JEE", color: "from-indigo-500/20 to-blue-500/20 text-indigo-600 bg-indigo-50" },
  { title: "Novels", color: "from-rose-500/20 to-orange-500/20 text-rose-600 bg-rose-50" },
  { title: "Poetry", color: "from-fuchsia-500/20 to-pink-500/20 text-fuchsia-600 bg-fuchsia-50" },
  { title: "Programming", color: "from-slate-500/20 to-gray-500/20 text-slate-600 bg-slate-50" },
];

const mockBooks = [
  { id: 1, title: "Atomic Habits", category: "Self Help", price: 299, condition: "Like New" },
  { id: 2, title: "HC Verma Vol 1", category: "JEE", price: 350, condition: "Good" },
  { id: 3, title: "Indian Polity", category: "UPSC", price: 450, condition: "Acceptable" },
  { id: 4, title: "Clean Code", category: "Programming", price: 599, condition: "Like New" },
];

export const Dashboard = () => {
  const { user } = useAuth();
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-primary text-white p-8 md:p-12 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary opacity-20 rounded-full blur-3xl -ml-20 -mb-20" />
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome back, {user?.name?.split(" ")[0] || "Reader"}!
          </h1>
          <p className="text-lg text-white/80 font-medium mb-8">
            Give your books a second life. Discover rare finds, sell your old textbooks, and build a sustainable reading habit.
          </p>
          <div className="flex space-x-4">
            <button className="bg-secondary text-primary font-semibold px-6 py-3 rounded-xl hover:bg-white hover:text-primary transition-colors shadow-lg shadow-secondary/20">
              Explore Marketplace
            </button>
            <button className="bg-white/10 backdrop-blur-md text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/20">
              Sell a Book
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Books Sold" value="12,450" icon={BookOpen} trend="+14% this month" colorClass="bg-blue-500" delay={0.1} />
        <StatsCard title="Active Listings" value="3,204" icon={Package} trend="+5% this week" colorClass="bg-primary" delay={0.2} />
        <StatsCard title="Verified Books" value="15,890" icon={TrendingUp} trend="+22% this month" colorClass="bg-secondary" delay={0.3} />
        <StatsCard title="Happy Readers" value="8,940" icon={Users} colorClass="bg-green-500" delay={0.4} />
      </div>

      {/* Category Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
          <button className="text-primary font-medium hover:text-secondary transition-colors">View All</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockCategories.map((cat, index) => (
            <CategoryCard key={cat.title} title={cat.title} colorClass={cat.color} delay={index * 0.05} />
          ))}
        </div>
      </div>

      {/* Featured Books Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Books</h2>
          <button className="text-primary font-medium hover:text-secondary transition-colors">View All</button>
        </div>
        <div className="flex overflow-x-auto pb-6 space-x-6 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {mockBooks.map((book) => (
            <BookCard key={book.id} book={book} onRentClick={() => setIsRentModalOpen(true)} />
          ))}
        </div>
      </div>

      {/* Rent Coming Soon Modal */}
      <RentModal isOpen={isRentModalOpen} onClose={() => setIsRentModalOpen(false)} />
    </div>
  );
};
