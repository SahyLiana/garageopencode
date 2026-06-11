import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Sun, Moon, LogOut, User as UserIcon, Newspaper,
  LayoutDashboard, Calendar, Car, BookOpen, Wrench, Users, Package,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import { useNotificationStore } from "../stores/notificationStore";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 5000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  const dashboardLink =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "MECHANIC"
        ? "/mechanic/appointments"
        : "/client/appointments";

  const navLinks = [
    ...(user?.role === "ADMIN"
      ? [
          { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
          { to: "/admin/users", label: "Users", icon: Users },
          { to: "/admin/inventory", label: "Inventory", icon: Package },
          { to: "/admin/appointments", label: "Appointments", icon: Calendar },
          { to: "/admin/vehicles", label: "Vehicles", icon: Car },
          { to: "/admin/news", label: "News", icon: Newspaper },
        ]
      : []),
    ...(user?.role === "MECHANIC"
      ? [
          {
            to: "/mechanic/appointments",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          { to: "/mechanic/news", label: "News", icon: Newspaper },
        ]
      : []),
    ...(user?.role === "CLIENT"
      ? [
          { to: "/client/appointments", label: "Dashboard", icon: LayoutDashboard },
          { to: "/client/book", label: "Book Now", icon: BookOpen },
          { to: "/client/vehicles", label: "My Garage", icon: Car },
          { to: "/client/news", label: "News", icon: Newspaper },
        ]
      : []),
  ];

  // Theme-aware classes
  const activeClass =
    "text-white bg-violet-600 dark:bg-gold-500 dark:text-violet-950 shadow-lg shadow-violet-200 dark:shadow-gold-500/20";
  const inactiveClass =
    "text-violet-900 dark:text-gold-200 hover:bg-violet-50 dark:hover:bg-gold-500/10";

  return (
    <nav
      className={`sticky top-0 z-[100] transition-all duration-500 ${
        scrolled
          ? "bg-white/80 dark:bg-violet-950/80 backdrop-blur-md py-3 shadow-xl border-b border-violet-100 dark:border-gold-500/20"
          : "bg-white dark:bg-violet-950 py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to={dashboardLink} className="flex items-center gap-2 group">
          <div className="bg-violet-600 dark:bg-gold-500 p-2 rounded-xl text-white dark:text-violet-950 group-hover:rotate-12 transition-transform shadow-lg">
            <Wrench size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter text-violet-950 dark:text-gold-500">
            GARAGE<span className="text-violet-600 dark:text-white">APP</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          {user &&
            navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/admin"}
                className={({ isActive }) => `
                px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                ${isActive ? activeClass : inactiveClass}
              `}
              >
                <link.icon size={14} />
                {link.label}
                {link.label === 'News' && unreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-2xl bg-violet-50 dark:bg-gold-500/10 text-violet-600 dark:text-gold-500 hover:bg-violet-100 dark:hover:bg-gold-500/20 transition-all border border-violet-100 dark:border-gold-500/20"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user && (
            <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-violet-100 dark:border-gold-500/20">
              <div className="text-right">
                <p className="text-[10px] font-black text-violet-400 dark:text-gold-400 uppercase tracking-widest leading-none">
                  {user.role}
                </p>
                <p className="text-sm font-bold text-violet-950 dark:text-white mt-1">
                  {user.name}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-50 dark:bg-red-500/10 p-2.5 rounded-2xl text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-100 dark:border-red-500/20"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 rounded-2xl bg-violet-50 dark:bg-gold-500/10 text-violet-600 dark:text-gold-500 transition-all"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-violet-950/60 backdrop-blur-sm z-[110] lg:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[320px] bg-white dark:bg-violet-950 z-[120] shadow-2xl lg:hidden overflow-y-auto border-l border-violet-100 dark:border-gold-500/20"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-center mb-12">
                  <span className="text-violet-400 dark:text-gold-500 font-black tracking-widest text-[10px] uppercase">
                    Staff Portal
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 rounded-2xl bg-violet-50 dark:bg-gold-500/10 text-violet-600 dark:text-gold-500"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-3 flex-1">
                  {user &&
                    navLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === "/admin"}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => `
                        flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest
                        ${isActive ? "bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950" : "text-violet-900 dark:text-gold-200 hover:bg-violet-50 dark:hover:bg-gold-500/10"}
                      `}
                      >
                        <link.icon size={18} />
                        {link.label}
                        {link.label === 'News' && unreadCount > 0 && (
                          <span className="ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </NavLink>
                    ))}
                </div>

                {user && (
                  <div className="pt-8 mt-8 border-t border-violet-100 dark:border-gold-500/20 space-y-8">
                    <div className="flex items-center gap-4 px-2">
                      <div className="w-14 h-14 rounded-[24px] bg-violet-600 dark:bg-gold-500 flex items-center justify-center text-white dark:text-violet-950 shadow-xl shadow-violet-200 dark:shadow-gold-500/20">
                        <UserIcon size={28} />
                      </div>
                      <div>
                        <p className="text-violet-950 dark:text-white font-black text-lg leading-none">
                          {user.name}
                        </p>
                        <p className="text-violet-400 dark:text-gold-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-4 p-5 rounded-[28px] bg-red-600 text-white font-black uppercase tracking-[0.2em] hover:bg-red-700 shadow-2xl shadow-red-600/20 transition-all"
                    >
                      <LogOut size={20} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
