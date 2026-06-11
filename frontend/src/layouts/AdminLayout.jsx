import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Package, Archive, Users, BarChart3, LogOut, Settings, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import clsx from "clsx";

const ADMIN_LINKS = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Pending Approvals", path: "/admin/approvals", icon: CheckSquare },
  { name: "Orders", path: "/admin/orders", icon: Package },
  { name: "Print Orders", path: "/admin/print-orders", icon: FileText },
  { name: "Inventory", path: "/admin/inventory", icon: Archive },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Reports", path: "/admin/reports", icon: BarChart3 },
  { name: "Settings", path: "/admin/settings", icon: Settings }
];

export const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white fixed h-full flex flex-col z-20">
        <div className="p-6 border-b border-gray-800">
          <Link to="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg">R</div>
            <span className="text-xl font-bold tracking-wide">RELIO <span className="text-xs text-primary bg-primary/20 px-2 py-0.5 rounded-full ml-1">ADMIN</span></span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {ADMIN_LINKS.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={clsx(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon size={20} className={isActive ? "text-primary" : "text-gray-400"} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-10 text-gray-900 dark:text-white transition-colors duration-300">
          <h2 className="text-lg font-semibold text-gray-900">Admin Operations</h2>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">A</div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-8 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};
