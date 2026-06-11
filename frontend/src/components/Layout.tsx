import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useThemeStore } from '../stores/themeStore';

export default function Layout() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen transition-colors duration-500 dark:bg-transparent">
      <Navbar />
      <main className="container mx-auto p-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}