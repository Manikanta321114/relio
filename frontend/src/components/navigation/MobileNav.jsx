import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, PlusCircle, User, Bell } from "lucide-react";
import clsx from "clsx";

export const MobileNav = () => {
  const location = useLocation();

  const mobileItems = [
    { name: "Home", path: "/dashboard", icon: LayoutDashboard },
    { name: "Market", path: "/marketplace", icon: ShoppingBag },
    { name: "Sell", path: "/sell-book", icon: PlusCircle, isMain: true },
    { name: "Alerts", path: "/notifications", icon: Bell },
    { name: "Profile", path: "/settings", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
      <div className="flex justify-around items-center h-16 px-2">
        {mobileItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link key={item.name} to={item.path} className="relative -top-5">
                <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                  <Icon size={28} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.path}
              className={clsx(
                "flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors",
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon size={22} className={clsx(isActive && "fill-primary/10")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
