import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  Car,
  Calendar,
  LogOut,
  Wrench,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";

export default function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const getLinks = () => {
    if (user?.role === "ADMIN") {
      return [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
        { name: "User Registry", path: "/admin/users", icon: Users },
        { name: "Inventory", path: "/admin/inventory", icon: Package },
        {
          name: "Operations",
          path: "/admin/appointments",
          icon: ClipboardList,
        },
        { name: "Asset Management", path: "/admin/vehicles", icon: Car },
      ];
    }
    if (user?.role === "MECHANIC") {
      return [
        { name: "Service Units", path: "/mechanic/appointments", icon: Wrench },
      ];
    }
    return [
      { name: "My Dashboard", path: "/client/appointments", icon: Calendar },
      { name: "My Assets", path: "/client/vehicles", icon: Car },
      { name: "Deploy Service", path: "/client/book", icon: PlusCircle },
    ];
  };

  const links = getLinks();

  return (
    <div className="w-72 min-h-screen bg-white dark:bg-violet-900 border-r border-violet-100 dark:border-violet-800 flex flex-col p-8 sticky top-0">
      <div className="mb-12 flex items-center gap-4 px-2">
        <div className="bg-violet-600 dark:bg-gold-500 p-2.5 rounded-2xl text-white dark:text-violet-950 shadow-lg shadow-violet-500/20">
          <ShieldCheck size={28} />
        </div>
        <span className="text-2xl font-black text-violet-950 dark:text-white tracking-tight">
          TestGarage
        </span>
      </div>

      <nav className="flex-1 space-y-3">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link key={link.path} to={link.path}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 px-5 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 shadow-xl shadow-violet-500/20 dark:shadow-gold-500/20"
                    : "text-violet-400 dark:text-violet-300/50 hover:bg-violet-50 dark:hover:bg-violet-800/50 hover:text-violet-600 dark:hover:text-gold-400"
                }`}
              >
                <link.icon
                  size={20}
                  className={isActive ? "text-white dark:text-violet-950" : ""}
                />
                {link.name}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => logout()}
        className="mt-auto flex items-center gap-4 px-5 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
      >
        <LogOut size={20} />
        Disconnect
      </button>
    </div>
  );
}
