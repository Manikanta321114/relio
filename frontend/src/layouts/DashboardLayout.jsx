import { useState } from "react";
import { Sidebar } from "../components/navigation/Sidebar";
import { Navbar } from "../components/navigation/Navbar";
import { MobileNav } from "../components/navigation/MobileNav";

export const DashboardLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden selection:bg-primary/20 selection:text-primary transition-colors duration-300">
      {/* Desktop Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
        {/* Navbar */}
        <Navbar toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>

      {/* Mobile Drawer Overlay (if we want a side drawer in mobile later) */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {/* We can add a mobile sidebar drawer here if needed, but we have bottom nav */}
        </div>
      )}
    </div>
  );
};
